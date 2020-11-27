import BpmnModeler from "bpmn-js/lib/Modeler";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

import diagramXML from "../resources/diagram.bpmn";

import customModule from "./custom";

import qaExtension from "../resources/qa";

const HIGH_PRIORITY = 1500;

const containerEl = document.getElementById("container"),
  qualityAssuranceEl = document.getElementById("quality-assurance"),
  suitabilityScoreEl = document.getElementById("suitability-score"),
  riskEl = document.getElementById("risk"),
  lastCheckedEl = document.getElementById("last-checked"),
  okayEl = document.getElementById("okay"),
  formEl = document.getElementById("form"),
  suitabilityWarningEl = document.getElementById("suitability-warning"),
  riskWarningEl = document.getElementById("risk-warning");

// hide quality assurance if user clicks outside
window.addEventListener("click", event => {
  const { target } = event;

  if (target === qualityAssuranceEl || qualityAssuranceEl.contains(target)) {
    return;
  }

  qualityAssuranceEl.classList.add("hidden");
});

// create modeler
const bpmnModeler = new BpmnModeler({
  container: containerEl,
  additionalModules: [customModule],
  moddleExtensions: {
    qa: qaExtension
  }
});

// import XML
bpmnModeler.importXML(diagramXML, err => {
  if (err) {
    console.error(err);
  }

  const moddle = bpmnModeler.get("moddle"),
    modeling = bpmnModeler.get("modeling");

  let analysisDetails, businessObject, element, suitabilityScore, risk;

  // validate suitability score
  function validate() {
    // const { value } = suitabilityScoreEl;

    if (isNaN(suitabilityScoreEl.value)) {
      suitabilityWarningEl.classList.remove("hidden");
      okayEl.disabled = true;
    } else if (isNaN(riskEl.value)) {
      riskWarningEl.classList.remove("hidden");
      okayEl.disabled = true;
    } else {
      suitabilityWarningEl.classList.add("hidden");
      riskWarningEl.classList.add("hidden");
      okayEl.disabled = false;
    }
  }

  // open quality assurance if user right clicks on element
  bpmnModeler.on("element.contextmenu", HIGH_PRIORITY, event => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    qualityAssuranceEl.classList.remove("hidden");

    ({ element } = event);

    // ignore root element
    if (!element.parent) {
      return;
    }

    businessObject = getBusinessObject(element);

    let { suitable, risk } = businessObject;

    suitabilityScoreEl.value = suitable ? suitable : "";
    riskEl.value = risk ? risk : "";

    suitabilityScoreEl.focus();

    analysisDetails = getExtensionElement(businessObject, "qa:AnalysisDetails");

    lastCheckedEl.textContent = analysisDetails
      ? analysisDetails.lastChecked
      : "-";

    validate();
  });

  // set suitability core and last checked if user submits
  formEl.addEventListener("submit", event => {
    event.preventDefault();
    event.stopPropagation();

    suitabilityScore = Number(suitabilityScoreEl.value);
    let riskValue = Number(riskEl.value);

    if (isNaN(suitabilityScore) && isNaN(risk)) {
      return;
    }

    const extensionElements =
      businessObject.extensionElements ||
      moddle.create("bpmn:ExtensionElements");

    if (!analysisDetails) {
      analysisDetails = moddle.create("qa:AnalysisDetails");

      extensionElements.get("values").push(analysisDetails);
    }

    analysisDetails.lastChecked = new Date().toISOString();

    modeling.updateProperties(element, {
      extensionElements,
      suitable: suitabilityScore,
      risk: riskValue
    });

    qualityAssuranceEl.classList.add("hidden");
  });

  // close quality assurance if user presses escape
  formEl.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      qualityAssuranceEl.classList.add("hidden");
    }
  });

  // validate suitability score if user inputs value
  suitabilityScoreEl.addEventListener("input", validate);
  riskEl.addEventListener("input", validate);
});

function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return;
  }

  return element.extensionElements.values.filter(extensionElement => {
    return extensionElement.$instanceOf(type);
  })[0];
}

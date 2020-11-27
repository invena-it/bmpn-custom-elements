const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERGE = 50,
  SUITABILITY_SCORE_LOW = 25,
  TASK_RISK_HIGH = 1;

export default class CustomContextPad {
  constructor(
    bpmnFactory,
    config,
    contextPad,
    create,
    elementFactory,
    injector,
    translate
  ) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get("autoPlace", false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const { autoPlace, bpmnFactory, create, elementFactory, translate } = this;

    function appendServiceTask(suitabilityScore) {
      return function(event, element) {
        if (autoPlace) {
          const businessObject = bpmnFactory.create("bpmn:Task");

          businessObject.suitable = suitabilityScore;

          const shape = elementFactory.createShape({
            type: "bpmn:Task",
            businessObject: businessObject
          });

          autoPlace.append(element, shape);
        } else {
          appendServiceTaskStart(event, element);
        }
      };
    }

    function appendServiceTaskStart(suitabilityScore) {
      return function(event) {
        const businessObject = bpmnFactory.create("bpmn:Task");

        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: "bpmn:Task",
          businessObject: businessObject
        });

        create.start(event, shape, element);
      };
    }

    function appendTaskRisk(risk) {
      return function(event, element) {
        if (autoPlace) {
          const businessObject = bpmnFactory.create("bpmn:Task");

          businessObject.risk = risk;

          const shape = elementFactory.createShape({
            type: "bpmn:Task",
            businessObject: businessObject
          });

          autoPlace.append(element, shape);
        } else {
          appendServiceTaskStart(event, element);
        }
      };
    }

    function appendTaskRiskStart(risk) {
      return function(event) {
        const businessObject = bpmnFactory.create("bpmn:Task");

        businessObject.risk = risk;

        const shape = elementFactory.createShape({
          type: "bpmn:Task",
          businessObject: businessObject
        });

        create.start(event, shape, element);
      };
    }

    return {
      "append.low-task": {
        group: "model",
        className: "bpmn-icon-task red",
        title: translate("Append Task with low suitability score"),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_LOW),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_LOW)
        }
      },
      "append.average-task": {
        group: "model",
        className: "bpmn-icon-task yellow",
        title: translate("Append Task with average suitability score"),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_AVERGE),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_AVERGE)
        }
      },
      "append.high-task": {
        group: "model",
        className: "bpmn-icon-task green",
        title: translate("Append Task with high suitability score"),
        action: {
          click: appendServiceTask(SUITABILITY_SCORE_HIGH),
          dragstart: appendServiceTaskStart(SUITABILITY_SCORE_HIGH)
        }
      },
      "append.high-risk-task": {
        group: "model",
        className: "fa fa-exclamation-triangle red",
        title: translate("Append Task with high risk"),
        action: {
          click: appendTaskRisk(TASK_RISK_HIGH),
          dragstart: appendServiceTaskStart(TASK_RISK_HIGH)
        }
      }
    };
  }
}

CustomContextPad.$inject = [
  "bpmnFactory",
  "config",
  "contextPad",
  "create",
  "elementFactory",
  "injector",
  "translate"
];

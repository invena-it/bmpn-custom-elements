const SUITABILITY_SCORE_HIGH = 100,
  SUITABILITY_SCORE_AVERGE = 50,
  SUITABILITY_SCORE_LOW = 25,
  TASK_RISK_HIGH = 1;

export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const { bpmnFactory, create, elementFactory, translate } = this;

    function createTask(suitabilityScore) {
      return function(event) {
        const businessObject = bpmnFactory.create("bpmn:Task");

        businessObject.suitable = suitabilityScore;

        const shape = elementFactory.createShape({
          type: "bpmn:Task",
          businessObject: businessObject
        });

        create.start(event, shape);
      };
    }

    function createHighRiskTask(risk) {
      return function(event) {
        const businessObject = bpmnFactory.create("bpmn:Task");

        businessObject.risk = risk;

        const shape = elementFactory.createShape({
          type: "bpmn:Task",
          businessObject: businessObject
        });

        create.start(event, shape);
      };
    }

    return {
      "create.low-task": {
        group: "activity",
        className: "bpmn-icon-task red",
        title: translate("Create Task with low suitability score"),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_LOW),
          click: createTask(SUITABILITY_SCORE_LOW)
        }
      },
      "create.average-task": {
        group: "activity",
        className: "bpmn-icon-task yellow",
        title: translate("Create Task with average suitability score"),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_AVERGE),
          click: createTask(SUITABILITY_SCORE_AVERGE)
        }
      },
      "create.high-task": {
        group: "activity",
        className: "bpmn-icon-task green",
        title: translate("Create Task with high suitability score"),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_HIGH),
          click: createTask(SUITABILITY_SCORE_HIGH)
        }
      },
      "create.high-risk-task": {
        group: "activity",
        className: "fa fa-exclamation-triangle red",
        title: translate("Create Task with high risk"),
        action: {
          click: createHighRiskTask(TASK_RISK_HIGH),
          dragstart: createHighRiskTask(TASK_RISK_HIGH)
        }
      }
    };
  }
}

CustomPalette.$inject = [
  "bpmnFactory",
  "create",
  "elementFactory",
  "palette",
  "translate"
];

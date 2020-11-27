import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  innerSVG
} from "tiny-svg";

import { getRoundRectPath } from "bpmn-js/lib/draw/BpmnRenderUtil";

import { is, getBusinessObject } from "bpmn-js/lib/util/ModelUtil";

import { isNil } from "min-dash";

const HIGH_PRIORITY = 1500,
  TASK_BORDER_RADIUS = 2,
  COLOR_GREEN = "#52B415",
  COLOR_YELLOW = "#ffc800",
  COLOR_RED = "#cc0000";

export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    // ignore labels
    return !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    const { suitabilityScore, risk } = this.getElementData(element);

    if (!isNil(suitabilityScore) && suitabilityScore > 0) {
      const color = this.getColor(suitabilityScore);

      const rect = drawRect(parentNode, 50, 20, TASK_BORDER_RADIUS, color);

      svgAttr(rect, {
        transform: "translate(-20, -10)"
      });

      var text = svgCreate("text");

      svgAttr(text, {
        fill: "#fff",
        transform: "translate(-15, 5)"
      });

      svgClasses(text).add("djs-label");

      svgAppend(text, document.createTextNode(suitabilityScore));

      svgAppend(parentNode, text);
    }

    if (risk > 0) {
      const path = svgCreate("path");
      svgAttr(path, {
        fill: "#ff0000",
        transform: "scale(0.05)",
        d:
          "M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
      });

      svgAppend(parentNode, path);
    }

    return shape;
  }

  getShapePath(shape) {
    if (is(shape, "bpmn:Task")) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }

  getElementData(element) {
    const businessObject = getBusinessObject(element);

    const { suitable, risk } = businessObject;

    return {
      suitabilityScore: Number.isFinite(suitable) ? suitable : null,
      risk: risk
    };
  }

  getColor(suitabilityScore) {
    if (suitabilityScore > 75) {
      return COLOR_GREEN;
    } else if (suitabilityScore > 25) {
      return COLOR_YELLOW;
    }

    return COLOR_RED;
  }
}

CustomRenderer.$inject = ["eventBus", "bpmnRenderer"];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
  const rect = svgCreate("rect");

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: color,
    strokeWidth: 2,
    fill: color
  });

  svgAppend(parentNode, rect);

  return rect;
}

import { Injectable } from '@angular/core';
// @ts-ignore
import * as svg from 'cytoscape-svg';
import * as cytoscape from 'cytoscape';
import { CollectionReturnValue, ElementsDefinition, NodeDefinition } from 'cytoscape';
import { NetworkNode } from '../../data/schema/network-node';
import { Network } from '../../data/schema/network';
import { Patient } from '../../data/schema/patient';
import { UtilService } from './util.service';
import { NodeColorByEnum } from '../enum/node-color-by.enum';
import { NodeSizeByEnum } from '../enum/node-size-by.enum';
import { PatientItem } from '../../data/schema/patient-item';
import { PatientSelectionEnum } from '../enum/patient-selection-enum';
import { ImageDownloadConfig } from '../../data/schema/image-download-config';
import { NetworkLayer } from '../../data/schema/network-layer';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  cyContainer!: HTMLElement;

  private cyCore!: cytoscape.Core;

  /**
   * List of locally used colors
   * @private
   */
  private colors = {
    red: '#ff3d6a',
    yellow: '#e8e857',
    blue: '#599eff',
    green: '#0b0',
    gray: '#888',
    highlight: '#333',
  };

  /**
   * Constructor, binding svg export library to cytoscape
   */
  constructor(private utilService: UtilService) {
    cytoscape.use(svg);
  }

  /**
   * Builds the layers for the concentric layout
   * @param nodes List of existing nodes within the network.ts
   */
  private buildLayer = (nodes: NetworkNode[]): any => {
    const layer: NetworkLayer = {};

    let nodesInLayer = 0;
    let layerIndex = 0;
    let counter = 0;
    let remaining = nodes.length;

    nodes.forEach((node) => {
      nodesInLayer += 1;
      counter += 1;

      layer[node.data.id] = layerIndex;

      let maxNodesInCurrentLayer = this.getMaxNodesInLayer(layerIndex);
      const maxNodesInNextLayer = this.getMaxNodesInLayer(layerIndex + 1);

      if (nodesInLayer === maxNodesInCurrentLayer) {
        remaining = nodes.length - counter;
        nodesInLayer = 0;
        layerIndex += 1;

        if (
          remaining > maxNodesInCurrentLayer &&
          remaining < maxNodesInCurrentLayer + maxNodesInNextLayer
        ) {
          maxNodesInCurrentLayer = Math.min(
            Math.floor(
              remaining * (maxNodesInCurrentLayer / maxNodesInCurrentLayer + maxNodesInNextLayer),
            ),
            maxNodesInCurrentLayer,
          );
        }
      }
    });

    (Object.keys(layer) as unknown as number[]).forEach((key: number) => {
      layer[key] = layerIndex + 1 - layer[key];
    });

    return layer;
  };

  /**
   * Returns the maximum valid number of nodes for a given layer
   * @param layer
   */
  private getMaxNodesInLayer = (layer: number): number => {
    switch (layer) {
      case 0:
        return 1;
      case 1:
        return 4;
      case 2:
        return 12;
      default:
        return 8 * (layer - 1) - 4 * Math.floor(Math.log2(layer) / Math.log2(8));
    }
  };

  /**
   * Returns the network.ts's default style
   */
  private getStyle(): any[] {
    return [
      {
        selector: 'node',
        style: {
          label: 'data(name)',
          'text-valign': 'center',
          'background-color': this.colors.gray,
          color: '#fff',
          'text-outline-color': this.colors.gray,
          'text-outline-width': '5px',
          width: '50px',
          height: '50px',
        },
      },
      {
        selector: 'node[color], node[colorMet], node[colorNonMet]',
        style: {
          color: '#383838',
          'font-weight': 'bold',
        },
      },
      {
        selector: 'node[!shown]',
        style: {
          visibility: 'hidden',
        },
      },
      {
        selector: 'node.mtb',
        style: {
          'border-width': '15px',
          'border-color': this.colors.green,
        },
      },
      {
        selector: 'node.split',
        style: {
          'text-outline-width': '0px',
          'text-outline-color': this.colors.gray,
          'text-outline-opacity': '0.3',
          width: '80px',
          height: '80px',
          'pie-size': '100%',
          'pie-1-background-color': 'green',
          'pie-1-background-size': '50%',
          'pie-2-background-color': 'green',
          'pie-2-background-size': '50%',
        },
      },

      {
        selector: 'node.highlight',
        style: {
          'border-width': '13px',
          'border-color': this.colors.highlight,
        },
      },
      {
        selector: 'edge[!shown]',
        style: {
          visibility: 'hidden',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
        },
      },
      {
        selector: 'edge.highlight',
        style: {
          width: 3,
          'line-color': this.colors.highlight,
        },
      },
    ];
  }

  /**
   * Returns the network.ts's concentric layout
   * @param nodes
   */
  private getLayout(nodes: NetworkNode[]): any {
    const layer = this.buildLayer(nodes);
    return {
      name: 'concentric',
      levelWidth() {
        return 1;
      },
      concentric(node: any) {
        return layer[node.data('id')];
      },
      spacingFactor: 1.65,
    };
  }

  /**
   * Initializes the core for the given container.
   * @param network Network elements
   */
  initializeCore(network: Network): void {
    const networkCopy = JSON.parse(JSON.stringify(network)) as ElementsDefinition;

    this.cyCore = cytoscape({
      container: this.cyContainer,
      elements: networkCopy,
      style: this.getStyle(),
      layout: this.getLayout(network.nodes),
    });

    this.cyCore.elements('node,edge').data('shown', true);
  }

  /**
   * Triggers the download for the specified download configuration
   */
  downloadImage(
    config: ImageDownloadConfig,
    patientA: Patient | null,
    patientB: Patient | null,
    patientSelection: PatientSelectionEnum,
  ): void {
    let filename = `network.ts`;

    switch (patientSelection) {
      case PatientSelectionEnum.groupA:
        if (patientA !== null) {
          filename = `${patientA.name}`;
        }
        break;
      case PatientSelectionEnum.groupB:
        if (patientB !== null) {
          filename = `${patientB.name}`;
        }
        break;
      case PatientSelectionEnum.both:
        if (patientA !== null && patientB !== null) {
          filename = `${patientA.name}_vs_${patientB.name}`;
        }
        break;
      default:
        filename = `PPI_network`;
        break;
    }
    filename = `${filename}.${config.extension}`;

    let image = this.getImage(config);
    if (config.extension === 'SVG') {
      image = new Blob([image], { type: 'text/plain;charset=utf-8' });
    } else {
      image = this.getImage(config);
    }

    const url = window.URL.createObjectURL(image);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Returns the image data as blob
   * @param config Download configuration containing information about file extension, background and scale
   * @private
   */
  private getImage(config: ImageDownloadConfig) {
    let image;
    const bgColor = config.transparent ? 'transparent' : 'white';
    if (config.extension === 'PNG') {
      image = this.cyCore.png({ bg: bgColor, scale: config.scale, output: 'blob' });
    } else if (config.extension === 'JPEG') {
      image = this.cyCore.jpg({ scale: config.scale, output: 'blob' });
    } else {
      // @ts-ignore
      image = this.cyCore.svg();
    }
    return image;
  }

  /**
   * Fits the graph to the current viewport
   */
  fitGraph(): void {
    this.cyCore.fit();
  }

  /**
   * Triggers the layout for zero, one or two selected patients depending on the user input.
   */
  layoutPatient(
    patientADetails: PatientItem[],
    patientBDetails: PatientItem[],
    patientGroupA: Patient[] | null,
    patientGroupB: Patient[] | null,
    geMin: number | null,
    geMax: number | null,
    network: Network,
    defined: number | null,
    minA: number | null,
    maxA: number | null,
    minB: number | null,
    maxB: number | null,
    nodeColorBy: NodeColorByEnum,
    nodeSizeBy: NodeSizeByEnum,
    showAllNodes: boolean,
    showOnlySharedNodes: boolean,
    showMtbResults: boolean,
  ) {
    this.updateMtbNodes(showMtbResults);

    if (
      patientADetails &&
      patientADetails?.length > 0 &&
      patientBDetails &&
      patientBDetails?.length > 0
    ) {
      this.clear();
      this.visualizeTwo(
        patientADetails,
        patientBDetails,
        geMin,
        geMax,
        defined,
        minA,
        maxA,
        minB,
        maxB,
        nodeColorBy,
      );
    } else if (patientADetails && patientADetails.length > 0) {
      this.visualizeOne(
        patientADetails,
        minA,
        maxA,
        nodeSizeBy,
        nodeColorBy,
        geMin,
        geMax,
        defined,
      );
    } else if (patientBDetails && patientBDetails.length > 0) {
      this.visualizeOne(
        patientBDetails,
        minB,
        maxB,
        nodeSizeBy,
        nodeColorBy,
        geMin,
        geMax,
        defined,
      );
    } else {
      this.clear();
      this.cyCore.elements('node').data('shown', true);
    }
    const patientSelected =
      (patientADetails && patientADetails.length > 0) ||
      (patientBDetails && patientBDetails.length > 0);
    this.updateShownNodes(showAllNodes, showOnlySharedNodes, patientSelected);
  }

  /**
   * Renders the network.ts for two selected patients
   * @private
   */
  private visualizeTwo(
    patientADetails: PatientItem[] | null,
    patientBDetails: PatientItem[] | null,
    geMin: number | null,
    geMax: number | null,
    defined: number | null,
    minA: number | null,
    maxA: number | null,
    minB: number | null,
    maxB: number | null,
    nodeColorBy: NodeColorByEnum,
  ) {
    this.cyCore.batch(() => {
      this.clear();
      const color = this.utilService.getColorByLiteral(nodeColorBy);
      switch (nodeColorBy) {
        case NodeColorByEnum.relevance:
          if (minA && minB && maxA && maxB) {
            this.setColorMap(Math.min(minA, minB), Math.max(maxA, maxB));
            this.setSplitColorMap(minA, maxA, minB, maxB);
          }
          break;
        case NodeColorByEnum.geneExpression:
          if (geMin && geMax) {
            this.setSplitColorMap(geMin, geMax, geMin, geMax);
          }
          break;
        case NodeColorByEnum.geneExpressionLevel:
        default:
          this.setColorDisc();
          break;
      }

      (patientADetails || []).forEach((data) => {
        if (defined && data.score >= defined) {
          const node = this.cyCore
            .nodes()
            .getElementById(data.id.toString())
            .data('member', true)
            .data('shown', true)
            .addClass('split')
            .data('colorMet', data[color as keyof PatientItem]);
          if (node && data.mtb) {
            node.addClass('mtb');
          }
        }
      });

      // loop non-metastatic patient data
      (patientBDetails || []).forEach((data) => {
        if (defined && data.score >= defined) {
          const node = this.cyCore
            .nodes()
            .getElementById(data.id.toString())
            .data('member', true)
            .data('shown', true)
            .addClass('split')
            .data('colorNonMet', data[color as keyof PatientItem]);
          if (node && data.mtb) {
            node.addClass('mtb');
          }
        }
      });
    });
  }

  private visualizeOne(
    patientDetails: PatientItem[],
    min: number | null,
    max: number | null,
    nodeSizeBy: NodeSizeByEnum,
    nodeColorBy: NodeColorByEnum,
    geMin: number | null,
    geMax: number | null,
    defined: number | null,
  ): void {
    this.cyCore.batch(() => {
      this.clear();

      // node size
      const size = this.utilService.getNodeSizeByLiteral(nodeSizeBy);
      switch (nodeSizeBy) {
        case NodeSizeByEnum.geneExpression:
          this.setSizeMap(
            this.utilService.getMinGe(patientDetails ?? []),
            this.utilService.getMaxGe(patientDetails ?? []),
          );
          break;
        case NodeSizeByEnum.relevance:
        default:
          if (min && max) {
            this.setSizeMap(min, max);
          }
          break;
      }

      // node colors
      const color = this.utilService.getColorByLiteral(nodeColorBy);
      switch (nodeColorBy) {
        case NodeColorByEnum.geneExpression:
          if (geMin && geMax) {
            this.setColorMap(geMin, geMax);
          }
          break;
        case NodeColorByEnum.geneExpressionLevel:
          this.setColorDisc();
          break;
        case NodeColorByEnum.relevance:
        default:
          if (min && max) {
            this.setColorMap(min, max);
          }
          break;
      }

      (patientDetails || []).forEach((data) => {
        if (defined && data.score >= defined) {
          const node = this.cyCore
            .nodes()
            .getElementById(data.id.toString())
            .data('member', true)
            .data('shown', true)
            .data('size', data[size as keyof PatientItem])
            .data('color', data[color as keyof PatientItem]);
          if (node && data.mtb) {
            node.addClass('mtb');
          }
        }
      });
    });
  }

  /**
   * Applies a visual style to nodes
   * @private
   */
  private setColorDisc() {
    // @ts-ignore
    this.cyCore.elements('node[color]').style('font-weight', 'bold');
    this.cyCore
      .style()
      // @ts-ignore
      .selector("node[color = 'LOW']")
      .style('background-color', this.colors.blue)
      .style('text-outline-color', this.colors.blue)
      // @ts-ignore
      .selector("node[color = 'NORMAL']")
      .style('background-color', this.colors.yellow)
      .style('text-outline-color', this.colors.yellow)
      // @ts-ignore
      .selector("node[color = 'HIGH']")
      .style('background-color', this.colors.red)
      .style('text-outline-color', this.colors.red)
      // @ts-ignore
      .selector('node.split[colorMet][colorNonMet]')
      .style('width', '80px')
      .style('height', '80px')
      // @ts-ignore
      .selector('node.split[^colorMet], node.split[^colorNonMet]')
      .style('pie-2-background-color', this.colors.gray)
      .style('pie-1-background-color', this.colors.gray)
      // @ts-ignore
      .selector("node.split[colorMet = 'LOW']")
      .style('pie-2-background-color', this.colors.blue)
      // @ts-ignore
      .selector("node.split[colorNonMet = 'LOW']")
      .style('pie-1-background-color', this.colors.blue)
      // @ts-ignore
      .selector("node.split[colorMet = 'NORMAL']")
      .style('pie-2-background-color', this.colors.yellow)
      // @ts-ignore
      .selector("node.split[colorNonMet = 'NORMAL']")
      .style('pie-1-background-color', this.colors.yellow)
      // @ts-ignore
      .selector("node.split[colorMet = 'HIGH']")
      .style('pie-2-background-color', this.colors.red)
      // @ts-ignore
      .selector("node.split[colorNonMet = 'HIGH']")
      .style('pie-1-background-color', this.colors.red);
  }

  /**
   * Applies a visual split style to nodes
   * @param minValueMet
   * @param maxValueMet
   * @param minValueNonMet
   * @param maxValueNonMet
   * @private
   */
  private setSplitColorMap(
    minValueMet: number,
    maxValueMet: number,
    minValueNonMet: number,
    maxValueNonMet: number,
  ) {
    const midPointMet = maxValueMet - (maxValueMet - minValueMet) / 2;
    const midPointNonMet = maxValueNonMet - (maxValueNonMet - minValueNonMet) / 2;
    const colorMapMet1 = `mapData(colorMet, ${minValueMet}, ${maxValueMet}, ${this.colors.blue}, ${this.colors.yellow})`;
    const colorMapMet2 = `mapData(colorMet, ${minValueMet}, ${maxValueMet}, ${this.colors.yellow}, ${this.colors.red})`;
    const colorMapNonMet1 = `mapData(colorNonMet, ${minValueNonMet}, ${maxValueNonMet}, ${this.colors.blue}, ${this.colors.yellow})`;
    const colorMapNonMet2 = `mapData(colorNonMet, ${minValueNonMet}, ${maxValueNonMet}, ${this.colors.yellow}, ${this.colors.red})`;
    this.cyCore
      .style()
      // @ts-ignore
      .selector('node.split[colorMet][colorNonMet]')
      .style('width', '80px')
      .style('height', '80px')
      // @ts-ignore
      .selector(`node.split[colorMet<=${midPointMet}]`)
      .style('pie-2-background-color', colorMapMet1)
      // @ts-ignore
      .selector(`node.split[colorMet>${midPointMet}]`)
      .style('pie-2-background-color', colorMapMet2)
      // @ts-ignore
      .selector(`node.split[colorNonMet<=${midPointNonMet}]`)
      .style('pie-1-background-color', colorMapNonMet1)
      // @ts-ignore
      .selector(`node.split[colorNonMet>${midPointNonMet}]`)
      .style('pie-1-background-color', colorMapNonMet2)
      // @ts-ignore
      .selector('node.split[colorMet][^colorNonMet]')
      .style('pie-1-background-color', this.colors.gray)
      // @ts-ignore
      .selector('node.split[^colorMet][colorNonMet]')
      .style('pie-2-background-color', this.colors.gray);
  }

  /**
   * Applies a visual style to nodes
   * @param minValue
   * @param maxValue
   * @private
   */
  private setColorMap(minValue: number, maxValue: number) {
    const midPoint = maxValue - (maxValue - minValue) / 2;
    const colorMap1 = `mapData(color, ${minValue}, ${midPoint}, ${this.colors.blue}, ${this.colors.yellow})`;
    const colorMap2 = `mapData(color, ${midPoint}, ${maxValue}, ${this.colors.yellow}, ${this.colors.red})`;

    this.cyCore
      .style()
      // @ts-ignore
      .selector(`node[color<=${midPoint}]`)
      .style('background-color', colorMap1)
      .style('text-outline-color', colorMap1)
      // @ts-ignore
      .selector(`node[color>${midPoint}]`)
      .style('background-color', colorMap2)
      .style('text-outline-color', colorMap2);
  }

  /**
   * Clears all applied styles
   * @private
   */
  private clear() {
    this.cyCore.batch(() => {
      this.cyCore
        .elements('node')
        .removeData('member')
        .removeData('color')
        .removeData('colorMet')
        .removeData('colorNonMet')
        .removeData('size')
        .removeClass('mtb')
        .removeClass('split');
      this.removeSizeMap();
    });
  }

  /**
   * Applies sizing to the nodes
   * @param minValue
   * @param maxValue
   * @private
   */
  private setSizeMap(minValue: number, maxValue: number) {
    const sizeMap = `mapData(size, ${minValue}, ${maxValue}, 50, 130)`;
    const fontSizeMap = `mapData(size, ${minValue}, ${maxValue}, 18, 30)`;
    this.cyCore
      .style()
      // @ts-ignore
      .selector('node[?member]')
      .style('width', sizeMap)
      .style('height', sizeMap)
      .style('font-size', fontSizeMap);
  }

  /**
   * Removes sizing from the nodes
   * @private
   */
  private removeSizeMap() {
    this.cyCore
      .style()
      // @ts-ignore
      .selector('node[?member]')
      .style('width', '50px')
      .style('height', '50px')
      .style('font-size', '18px');
  }

  /**
   * If the displayed nodes are not modified themselves,
   * it's sufficient to update which nodes are displayed.
   */
  updateShownNodes(showAllNodes: boolean, showOnlySharedNodes: boolean, patientSelected: boolean) {
    this.cyCore.batch(() => {
      this.cyCore.elements('node[member]').data('shown', true);
      this.cyCore.elements('node[!member]').data('shown', patientSelected ? showAllNodes : true);
      (this.cyCore.elements('node[member]').connectedEdges() as CollectionReturnValue).data(
        'shown',
        true,
      );
      (this.cyCore.elements('node[!member]').connectedEdges() as CollectionReturnValue).data(
        'shown',
        patientSelected ? showAllNodes : true,
      );
      this.cyCore
        .elements('node.split[colorMet][^colorNonMet]')
        .data('shown', !showOnlySharedNodes);
      this.cyCore
        .elements('node.split[^colorMet][colorNonMet]')
        .data('shown', !showOnlySharedNodes);
      (
        this.cyCore
          .elements('node.split[colorMet][^colorNonMet], node.split[^colorMet][colorNonMet]')
          .connectedEdges('edge[?shown]') as CollectionReturnValue
      ).data('shown', !showOnlySharedNodes);
    });
  }

  /**
   * Updates the node style based on if the mtb property is to be displayed.
   * @param showMtbResults Value of showing mtb results
   */
  private updateMtbNodes(showMtbResults: boolean): void {
    this.cyCore
      .style()
      // @ts-ignore
      .selector('node.mtb')
      .style('border-width', showMtbResults ? '7px' : '0px');
  }

  /**
   * Applies the style for selected nodes to the list of currently selected nodes.
   * All other styles are reset to their default.
   * @param markedNodes List of currently selected nodes
   */
  highlightNode(markedNodes: NetworkNode[]) {
    const nodes: string[] = markedNodes.map((a) => a.data.id.toString());
    this.cyCore.elements('node').removeClass('highlight');
    this.cyCore.elements('edge').removeClass('highlight');
    if (nodes !== undefined) {
      nodes.forEach((node) => {
        this.cyCore
          .nodes()
          .getElementById(node)
          .addClass('highlight')
          .connectedEdges()
          .addClass('highlight');
      });
    }
  }
}
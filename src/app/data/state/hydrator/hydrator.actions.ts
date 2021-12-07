import { createAction, props } from '@ngrx/store';
import { Network } from '../../schema/network';
import { PatientCollection } from '../../schema/patient-collection';
import { Threshold } from '../../schema/threshold';
import { Patient } from '../../schema/patient';
import { PatientItem } from '../../schema/patient-item';
import { NodeColorByEnum } from '../../../core/enum/node-color-by.enum';
import { NodeSizeByEnum } from '../../../core/enum/node-size-by.enum';
import { NetworkNode } from '../../schema/network-node';
import { ImageDownloadConfig } from '../../schema/image-download-config';
import { SidebarVisibilityEnum } from '../../../core/enum/sidebar-visibility.enum';

export const loadQueryParams = createAction(
  '[Layout Component] load query params',
  props<{ params: any }>(),
);

export const loadDataSuccess = createAction(
  '[Hydrator Effects] load data success',
  props<{ network: Network; patients: PatientCollection; thresholds: Threshold }>(),
);
export const loadDataFailure = createAction('[Hydrator Effects] load data failure');

export const hydrateAbort = createAction('[Hydrator Effects] hydrate abort');

export const hydratePatientAPatientBSuccess = createAction(
  '[Hydrator Effects] hydrate patient A patient B success',
  props<{
    patientA: Patient | null;
    patientB: Patient | null;
    patientADetails: PatientItem[];
    patientBDetails: PatientItem[];
  }>(),
);
export const hydratePatientAPatientBFailure = createAction(
  '[Hydrator Effects] hydrate patient A patient B failure',
);

export const hydrateThresholdSuccess = createAction(
  '[Hydrator Effects] hydrate threshold success',
  props<{ defined: number }>(),
);
export const hydrateThresholdFailure = createAction('[Hydrator Effects] hydrate threshold failure');

export const hydrateLayoutSuccess = createAction(
  '[Hydrator Effects] hydrate layout success',
  props<{
    showAll: boolean;
    showShared: boolean;
    showMtb: boolean;
    nodeColorBy: NodeColorByEnum;
    nodeSizeBy: NodeSizeByEnum;
  }>(),
);
export const hydrateLayoutFailure = createAction('[Hydrator Effects] hydrate layout failure');

export const hydrateNodesSuccess = createAction(
  '[Hydrator Effects] hydrate nodes selection success',
  props<{
    selection: NetworkNode[];
    subtypeColumnA: string | null;
    subtypeColumnB: string | null;
  }>(),
);
export const hydrateNodesFailure = createAction(
  '[Hydrator Effects] hydrate nodes selection failure',
);

export const hydrateDownloadConfigSuccess = createAction(
  '[Hydrator Effects] hydrate download config success',
  props<{ downloadConfig: ImageDownloadConfig }>(),
);
export const hydrateDownloadConfigFailure = createAction(
  '[Hydrator Effects] hydrate download config failure',
);

export const hydrateSidebarVisibilitySuccess = createAction(
  '[Hydrator Effects] hydrate sidebar visibility success',
  props<{ visibility: SidebarVisibilityEnum }>(),
);
export const hydrateSidebarVisibilityFailure = createAction(
  '[Hydrator Effects] hydrate sidebar visibility failure',
);

export const hydrateTriggerDownloadSuccess = createAction(
  '[Hydrator Effects] hydrate trigger download success',
);

export const hydrationEnded = createAction('[Hydrator Effects] hydration ended');
export const markMultipleNodes = createAction(
  '[Hydrator Effects] mark multiple nodes',
  props<{ nodes: NetworkNode[] }>(),
);

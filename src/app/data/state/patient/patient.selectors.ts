import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { PatientState } from './patient.state';

const selectState = createSelector(
  (appState: AppState) => appState.patient,
  (state: PatientState) => state,
);

export const selectPatientGroupA = createSelector(
  selectState,
  (state: PatientState) => state.groupA,
);

export const selectPatientGroupB = createSelector(
  selectState,
  (state: PatientState) => state.groupB,
);

export const selectPatientA = createSelector(selectState, (state: PatientState) => state.patientA);

export const selectPatientB = createSelector(selectState, (state: PatientState) => state.patientB);

export const selectPatientADetails = createSelector(
  selectState,
  (state: PatientState) => state.patientADetails,
);

export const selectPatientBDetails = createSelector(
  selectState,
  (state: PatientState) => state.patientBDetails,
);

export const selectIsLoading = createSelector(
  selectState,
  (state: PatientState) => state.isLoading,
);

export const selectPatientSelection = createSelector(
  selectState,
  (state: PatientState) => state.patientSelection,
);

export const selectGeMin = createSelector(
  selectState,
  (state: PatientState) => state.geMin,
);

export const selectGeMax = createSelector(
  selectState,
  (state: PatientState) => state.geMax,
);

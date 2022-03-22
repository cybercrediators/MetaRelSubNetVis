import { createReducer, on } from '@ngrx/store';
import { ThresholdState } from './threshold.state';
import { setDefined } from './threshold.action';
import {
  hydrateThresholdSuccess,
  loadDataSuccess,
  loadQueryParams,
} from '../hydrator/hydrator.actions';

const initialState: ThresholdState = {
  groupA: null,
  groupB: null,
  defined: null,
  multiplier: 1000000000,
  isLoading: false,
  labelMin: null,
  labelMax: null,
};

export const thresholdReducer = createReducer(
  initialState,
  on(loadQueryParams, (state: ThresholdState): ThresholdState => ({ ...state, isLoading: true })),
  on(loadDataSuccess, (state: ThresholdState, payload): ThresholdState => {
    return {
      ...state,
      isLoading: false,
      groupA: payload.thresholds.groupA,
      groupB: payload.thresholds.groupB,
      labelMax: Math.max(payload.thresholds.groupA.max, payload.thresholds.groupB.max).toString(),
    };
  }),
  on(
    setDefined,
    hydrateThresholdSuccess,
    (state: ThresholdState, { defined }): ThresholdState => ({
      ...state,
      defined,
      labelMin: defined.toString(),
    }),
  ),
);

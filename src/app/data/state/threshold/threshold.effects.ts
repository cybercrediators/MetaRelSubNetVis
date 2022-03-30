import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ApiService } from '../../service/api.service';
import { setDefined, setLabelMin } from './threshold.action';
import { setPatientSelection } from '../patient/patient.actions';
import { AppState } from '../app.state';
import { selectDefined, selectMinA, selectMinB } from './threshold.selectors';
import { selectPatientSelection } from '../patient/patient.selectors';
import { PatientSelectionEnum } from '../../../core/enum/patient-selection-enum';

@Injectable()
export class ThresholdEffects {
  resetDefined$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setPatientSelection),
      concatLatestFrom(() => [
        this.store.select(selectPatientSelection),
        this.store.select(selectMinA),
        this.store.select(selectMinB),
        this.store.select(selectDefined),
      ]),
      mergeMap(([action, patientSelection, minA, minB, defined]) => {
        // there was a change in patient group selection
        if (action.previousSelection !== patientSelection) {
          if (patientSelection === PatientSelectionEnum.both && minA !== null && minB !== null) {
            return [
              setDefined({
                defined: Math.min(minA, minB),
              }),
              setLabelMin({ labelMin: Math.min(minA, minB).toString() }),
            ];
          }
          if (patientSelection === PatientSelectionEnum.groupA && minA !== null) {
            return [
              setDefined({
                defined: minA,
              }),
              setLabelMin({ labelMin: minA.toString() }),
            ];
          }
          if (patientSelection === PatientSelectionEnum.groupB && minB !== null) {
            return [
              setDefined({
                defined: minB,
              }),
              setLabelMin({ labelMin: minB.toString() }),
            ];
          }
          // defaulting
          return [
            setDefined({
              defined: Number.MIN_SAFE_INTEGER,
            }),
            setLabelMin({ labelMin: '-' }),
          ];
        }

        if (defined !== null) {
          return [
            setDefined({
              defined,
            }),
          ];
        }
        return [
          setDefined({
            defined: Number.MIN_SAFE_INTEGER,
          }),
        ];
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private store: Store<AppState>,
  ) {
  }
}
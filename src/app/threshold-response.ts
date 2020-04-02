import {Threshold} from './threshold';
import {ClassResponse} from './class-response';

export class ThresholdResponse implements ClassResponse {
  // constructor(public metastatic: Threshold,
  //             public nonmetastatic: Threshold,
  //             public multiplier: number = 1000000000) {}

  // public static multiplier = 1000000000;
  public multiplier: number = 1000000000;
  public metastatic: Threshold;
  public nonmetastatic: Threshold;

  constructor(data:any){
    this.multiplier = 1000000000;
    this.metastatic = new Threshold(data.metastatic, this.multiplier);
    this.nonmetastatic = new Threshold(data.nonmetastatic, this.multiplier);
  }

  // constructor(data: any) {
  //   Object.assign(this, data);
  // }
  //
  // public static init(obj: ThresholdResponse){
  //   obj.multiplier = 1000000000;
  // }

}

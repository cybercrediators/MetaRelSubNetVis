import { Network } from '../../schema/network';

export interface NetworkState {
  network: Network | null;
  headline: string | null;
  uuid: string | null;
  isLoading: boolean;
}

import {defaultLocalOptions, LocalOptions} from '@/config/options';
import {createOptionsStore, mergeLocalDefaultOptions} from '@/helpers/options';

export const useLocalOptionsStore = createOptionsStore<LocalOptions>('local', defaultLocalOptions(), mergeLocalDefaultOptions);
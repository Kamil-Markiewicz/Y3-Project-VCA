import '../sass/style.scss'

import {$, $$} from './modules/bling'
import geoAutocomplete from './modules/geoAutocomplete'

geoAutocomplete( $('#address'), $('#lat'), $('#long') );
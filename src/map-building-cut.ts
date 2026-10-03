import polygonClipping from 'polygon-clipping';
import type {MultiPolygon as ClipMultiPolygon} from 'polygon-clipping';
import type {Polygon,MultiPolygon} from 'geojson';
import {buildingParts} from './map-building-state';
/** Subtract the whole destroyed footprint, including partial overlaps and holes. */
export function cutBuildings(geometry:Polygon|MultiPolygon,cuts:(Polygon|MultiPolygon)[]):MultiPolygon{
 const parts=buildingParts(geometry) as ClipMultiPolygon;
 return {type:'MultiPolygon',coordinates:polygonClipping.difference(parts,...cuts.map(g=>buildingParts(g) as ClipMultiPolygon))};
}

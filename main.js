import axios from "axios";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

const coords = prompt("Vnesite koordinate: ");
//const coords = "45.54269608730146, 13.731885705662341";

let north = coords.split(", ")[0];
let east = coords.split(", ")[1];

let formatted_coords = east+","+north+","+east+","+north;
makeRequest(formatted_coords);

async function makeRequest(formatted_coords) {
    let eid_parcela;
    let st_parcele;
    let id_obcine;
    let naziv_upravljalca;
    let naziv_lastnika;
    let naziv_obcine;
    try {
        //poišči id-je
        let url = "https://ipi.eprostor.gov.si/wfs-si-gurs-kn/ogc/features/collections/SI.GURS.KN:OSNOVNI_PARCELE/items?limit=1&bbox="+formatted_coords+"&filter-lang=cql-text&bbox-crs=EPSG%3A4326&additionalProp1=";
        const id_response = await axios.get(url);
        if(id_response.data.features.length > 0){
            eid_parcela = id_response.data.features[0].properties.EID_PARCELA;
            st_parcele = id_response.data.features[0].properties.ST_PARCELE;
            id_obcine = (id_response.data.features[0].properties.KO_ID).toString();
        }else{
            console.log("Parcela ne obstaja");
            return;
        }

        //poišči upravljalce
        let url_upravljalec = 'https://ipi.eprostor.gov.si/wfs-si-gurs-kn/wfs?request=GetFeature&version=2.0.0&typeName=SI.GURS.KN:PARCELE_UPRAVLJAVCI&REFERER_APP_CODE=JV&outputFormat=application/json&cql_filter=EID_PARCELA='+eid_parcela;
        const response_upravljalec = await axios.get(url_upravljalec);
        if(response_upravljalec.data.features.length > 0){
            naziv_upravljalca = response_upravljalec.data.features[0].properties.NAZIV;
        }else{
            naziv_upravljalca = "Upravljalec ni vpisan";
        }

        //poišči lastnike
        let url_lastnik = "https://ipi.eprostor.gov.si/javni-service-api/v1/external/std-service/features?featureType=JAVNI_SERVIS_LASTNIKI_PARCELE.JSON&filter="+eid_parcela;
        const response_lastnik = await axios.get(url_lastnik);
        naziv_lastnika = response_lastnik.data.pravice[0].imetniki[0].ime_naziv;

        //poišči naziv občine
        let url_naziv_obcine = "https://ipi.eprostor.gov.si/wfs-si-gurs-kn/wfs?request=GetFeature&version=2.0.0&typeName=SI.GURS.KN:PARCELE&REFERER_APP_CODE=JV&outputFormat=application/json&cql_filter=EID="+eid_parcela;
        const response_obcina = await axios.get(url_naziv_obcine);
        naziv_obcine = response_obcina.data.features[0].properties.NAZIV;

        //format response
        let return_obj = {
            eid: eid_parcela,
            st_parcele: st_parcele,
            id_obcine: id_obcine,
            obcina: naziv_obcine,
            upravljalec: naziv_upravljalca,
            lastnik: naziv_lastnika
        }
        console.log(return_obj);
    } catch (error) {
        console.error(error);
    }
  }
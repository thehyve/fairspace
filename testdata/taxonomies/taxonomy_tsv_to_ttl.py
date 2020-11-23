#!/usr/bin/env python3
import csv

input_filename = "taxonomies.tsv"
output_filename = "taxonomies.ttl"

RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#"
RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
CURIE_NS = "https://institut-curie.org/ontology#"
ANALYSIS_NS = "https://institut-curie.org/analysis#"
FHIR_NS = "http://hl7.org/fhir/"
NCI_NS = "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#"
NCBI_NS = "https://bioportal.bioontology.org/ontologies/NCBITAXON/"
ICDO3T_NS = "https://bioportal.bioontology.org/ontologies/ICD-O-3-T/"
ICDO3M_NS = "https://bioportal.bioontology.org/ontologies/ICD-O-3-M/"
UICC_NS = "https://www.uicc.org/>"

TYPE_COLUMN_NAME = "ConceptualDomain"
URL_COLUMN_NAME = "url"
LABEL_COLUMN_NAME = "LabelValueMeaning"
ID_COLUMN_NAME = "ValueMeaning"
UPDATED_ID_COLUMN_NAME = "UpdatedValueMeaning"

GENDER_DOMAIN = "OSIRIS:AdministrativeGender"
TOPOGRAPHY_DOMAIN = "ICDO3:Topography"
MORPHOLOGY_DOMAIN = "ICDO3:Morphology"
SPECIES_DOMAIN = "KDI:Species"
SAMPLE_NATURE_DOMAIN = "OSIRIS:SampleNature"
SAMPLE_ORIGIN_DOMAIN = "OSIRIS:SampleOrigin"
EVENT_TYPE_DOMAIN = "OSIRIS:EventType"
LATERALITY_DOMAIN = "OSIRIS:Laterality"
TNM_TYPE_DOMAIN = "OSIRIS:TNMType"
TNM_T_DOMAIN = "OSIRIS:T_TNM"
TNM_N_DOMAIN = "OSIRIS:N_TNM"
TNM_M_DOMAIN = "OSIRIS:M_TNM"
ANALYSIS_TYPE_DOMAIN = "OSIRIS:AnalysisType"
TECHNICAL_PROTOCOL_DOMAIN = "OSIRIS:TechnicalProtocol"

LABEL_URI = RDFS_NS + "label"
GENDER_URI = CURIE_NS + "Gender"
TOPOGRAPHY_URI = CURIE_NS + "Topography"
MORPHOLOGY_URI = CURIE_NS + "Morphology"
SPECIES_URI = CURIE_NS + "Species"
SAMPLE_NATURE_URI = CURIE_NS + "SampleNature"
SAMPLE_ORIGIN_URI = CURIE_NS + "SampleOrigin"
EVENT_TYPE_URI = CURIE_NS + "EventType"
LATERALITY_URI = CURIE_NS + "Laterality"
TUMOR_GRADE_TYPE_URI = CURIE_NS + "TumorGradeType"
TNM_TYPE_URI = CURIE_NS + "TnmType"
TNM_T_URI = CURIE_NS + "TnmT"
TNM_N_URI = CURIE_NS + "TnmN"
TNM_M_URI = CURIE_NS + "TnmM"
ANALYSIS_TYPE_URI = CURIE_NS + "AnalysisType"

UNKNOWN_CODE = "UMLS:C0439673"


def write_triples(row, entity_type_uri, get_entity_iri):
    if (row[ID_COLUMN_NAME] != "") and (row[ID_COLUMN_NAME] != UNKNOWN_CODE) and (row[UPDATED_ID_COLUMN_NAME] != '-'):
        url = get_entity_iri(row)
        results.append("<{0}> a <{1}> ;".format(url, entity_type_uri))
        results.append("  <{0}> \"{1}\" .".format(LABEL_URI, row[LABEL_COLUMN_NAME]))

def read_entity(entity, entity_type_uri, get_entity_iri):
    file.seek(0)
    for row in reader:
        if row[TYPE_COLUMN_NAME] == entity:
            write_triples(row, entity_type_uri, get_entity_iri)

def save_to_file(*triples):
    with open(output_filename, mode='wt', encoding='utf-8') as output_file:
        for lines in triples:
            output_file.write('\n'.join(str(line) for line in lines))
            output_file.write('\n')

def get_gender_iri(row):
    return "{}administrative-gender#{}".format(FHIR_NS, row[LABEL_COLUMN_NAME].lower())

def get_topography_iri(row):
    return "{}{}".format(ICDO3T_NS, row[ID_COLUMN_NAME].rsplit(':', 1)[1])

def get_morphology_iri(row):
    return "{}{}".format(ICDO3M_NS, row[ID_COLUMN_NAME].rsplit(':', 1)[1])

def get_species_iri(row):
    return "{}{}".format(NCBI_NS, row[ID_COLUMN_NAME].replace('NCBI:txid', ''))

def get_sample_nature_iri(row):
    return "{}{}".format(NCI_NS, row[UPDATED_ID_COLUMN_NAME].rsplit(':', 1)[1])

def get_sample_origin_iri(row):
    return "{}{}".format(CURIE_NS, row[LABEL_COLUMN_NAME].lower())

def get_event_type_iri(row):
    return "{}{}".format(NCI_NS, row[UPDATED_ID_COLUMN_NAME].rsplit(':', 1)[1])

def get_laterality_iri(row):
    return "{}{}".format(NCI_NS, row[UPDATED_ID_COLUMN_NAME].rsplit(':', 1)[1])

def get_tnm_iri(row):
    return "{}{}".format(CURIE_NS, row[ID_COLUMN_NAME].lower())

def get_analysis_type_iri(row):
    return "{}{}".format(ANALYSIS_NS, row[ID_COLUMN_NAME].rsplit(':', 1)[1])


results = []

file = open(input_filename)
reader = csv.DictReader(file, delimiter='\t')

read_entity(GENDER_DOMAIN, GENDER_URI, get_gender_iri)
read_entity(TOPOGRAPHY_DOMAIN, TOPOGRAPHY_URI, get_topography_iri)
read_entity(MORPHOLOGY_DOMAIN, MORPHOLOGY_URI, get_morphology_iri)
read_entity(SPECIES_DOMAIN, SPECIES_URI, get_species_iri)
read_entity(SAMPLE_NATURE_DOMAIN, SAMPLE_NATURE_URI, get_sample_nature_iri)
read_entity(SAMPLE_ORIGIN_DOMAIN, SAMPLE_ORIGIN_URI, get_sample_origin_iri)
read_entity(EVENT_TYPE_DOMAIN, EVENT_TYPE_URI, get_event_type_iri)
read_entity(LATERALITY_DOMAIN, LATERALITY_URI, get_laterality_iri)
read_entity(TNM_TYPE_DOMAIN, TNM_TYPE_URI, get_tnm_iri)
read_entity(TNM_T_DOMAIN, TNM_T_URI, get_tnm_iri)
read_entity(TNM_N_DOMAIN, TNM_N_URI, get_tnm_iri)
read_entity(TNM_M_DOMAIN, TNM_M_URI, get_tnm_iri)
read_entity(ANALYSIS_TYPE_DOMAIN, ANALYSIS_TYPE_URI, get_analysis_type_iri)
read_entity(TECHNICAL_PROTOCOL_DOMAIN, ANALYSIS_TYPE_URI, get_analysis_type_iri)

save_to_file(results)


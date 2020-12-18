PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX curie: <https://institut-curie.org/ontology#>
PREFIX fs:    <http://fairspace.io/ontology#>

<#if fetch>
SELECT ?Sample ?Sample_topography ?Sample_nature ?Sample_origin ?Sample_tumorCellularity
?TumorPathologyEvent ?TumorPathologyEvent_topography ?TumorPathologyEvent_morphology ?TumorPathologyEvent_eventType
?TumorPathologyEvent_laterality ?TumorPathologyEvent_tumorGradeType ?TumorPathologyEvent_tumorGradeValue ?TumorPathologyEvent_tnmType ?TumorPathologyEvent_tnmT ?TumorPathologyEvent_tnmN ?TumorPathologyEvent_tnmM ?TumorPathologyEvent_ageAtDiagnosis
?Subject ?Subject_gender ?Subject_species ?Subject_ageAtLastNews ?Subject_ageAtDeath
<#else>
SELECT ?Sample
</#if>
WHERE {
<#if fetch>
VALUES ?Sample { ${iris} }
<#elseif Collection_collection?? || Collection_analysisType??>
{
  SELECT DISTINCT ?smpl WHERE {
     <#if Collection_collection??> ?Collection_collection a fs:Collection . ${Collection_collection}  ?Collection (fs:belongsTo)* ?Collection_collection . </#if>
     ?Collection curie:sample ?smpl .
     <#if Collection_analysisType??> ?Collection curie:analysisType ?Collection_analysisType . ${Collection_analysisType}</#if>
  }
}
BIND(?smpl AS ?Sample)
</#if>

<#if fetch || Sample_topography??> OPTIONAL {?Sample curie:topography ?Sample_topography } ${Sample_topography!} </#if>
<#if fetch || Sample_nature??>     OPTIONAL {?Sample curie:isOfNature ?Sample_nature } ${Sample_nature!} </#if>
<#if fetch || Sample_origin??>     OPTIONAL {?Sample curie:hasOrigin ?Sample_origin } ${Sample_origin!} </#if>
<#if fetch || Sample_tumorCellularity??> OPTIONAL {?Sample curie:tumorCellularity ?Sample_tumorCellularity } ${Sample_tumorCellularity!} </#if>

<#assign has_Subject_filter = Subject_species?? || Subject_gender?? || Subject_ageAtLastNews?? || Subject_ageAtDeath??>
<#if fetch || has_Subject_filter>
  <#if !has_Subject_filter>OPTIONAL {</#if>
    ?Sample curie:subject ?Subject .
    <#if fetch || Subject_species??>OPTIONAL {?Subject curie:isOfSpecies ?Subject_species} ${Subject_species!}</#if>
    <#if fetch || Subject_gender??> OPTIONAL {?Subject curie:gender ?Subject_gender} ${Subject_gender!}</#if>
    <#if fetch || Subject_ageAtLastNews??>OPTIONAL {?Subject curie:ageAtLastNews ?Subject_ageAtLastNews} ${Subject_ageAtLastNews!}</#if>
    <#if fetch || Subject_ageAtDeath??>OPTIONAL {?Subject curie:ageAtDeath ?Subject_ageAtDeath} ${Subject_ageAtDeath!}</#if>
  <#if !has_Subject_filter>}</#if>
</#if>

<#assign has_event_filter = TumorPathologyEvent_morphology?? || TumorPathologyEvent_topography?? || TumorPathologyEvent_eventType?? || TumorPathologyEvent_laterality?? || TumorPathologyEvent_ageAtDiagnosis?? || TumorPathologyEvent_tumorGradeType?? || TumorPathologyEvent_tumorGradeValue?? || TumorPathologyEvent_tnmType?? || TumorPathologyEvent_tnmT?? || TumorPathologyEvent_tnmN?? || TumorPathologyEvent_tnmM??>
<#if fetch || has_event_filter>
  <#if !has_event_filter>OPTIONAL {</#if>
    ?Sample curie:diagnosis ?TumorPathologyEvent .

    <#if fetch || TumorPathologyEvent_morphology??>      OPTIONAL { ?TumorPathologyEvent curie:tumorMorphology ?TumorPathologyEvent_morphology } ${TumorPathologyEvent_morphology!} </#if>
    <#if fetch || TumorPathologyEvent_eventType??>       OPTIONAL { ?TumorPathologyEvent curie:eventType ?TumorPathologyEvent_eventType } ${TumorPathologyEvent_eventType!} </#if>
    <#if fetch || TumorPathologyEvent_topography??>      OPTIONAL { ?TumorPathologyEvent curie:topography ?TumorPathologyEvent_topography } ${TumorPathologyEvent_topography!} </#if>
    <#if fetch || TumorPathologyEvent_laterality??>      OPTIONAL { ?TumorPathologyEvent curie:tumorLaterality ?TumorPathologyEvent_laterality } ${TumorPathologyEvent_laterality!} </#if>
    <#if fetch || TumorPathologyEvent_ageAtDiagnosis??>  OPTIONAL { ?TumorPathologyEvent curie:ageAtDiagnosis ?TumorPathologyEvent_ageAtDiagnosis } ${TumorPathologyEvent_ageAtDiagnosis!} </#if>
    <#if fetch || TumorPathologyEvent_tumorGradeType??>  OPTIONAL { ?TumorPathologyEvent curie:tumorGradeType ?TumorPathologyEvent_tumorGradeType } ${TumorPathologyEvent_tumorGradeType!} </#if>
    <#if fetch || TumorPathologyEvent_tumorGradeValue??> OPTIONAL { ?TumorPathologyEvent curie:tumorGradeValue ?TumorPathologyEvent_tumorGradeValue } ${TumorPathologyEvent_tumorGradeValue!} </#if>
    <#if fetch || TumorPathologyEvent_tnmType??>         OPTIONAL { ?TumorPathologyEvent curie:tnmType ?TumorPathologyEvent_tnmType } ${TumorPathologyEvent_tnmType!} </#if>
    <#if fetch || TumorPathologyEvent_tnmT??>            OPTIONAL { ?TumorPathologyEvent curie:tnmT ?TumorPathologyEvent_tnmT } ${TumorPathologyEvent_tnmT!} </#if>
    <#if fetch || TumorPathologyEvent_tnmN??>            OPTIONAL { ?TumorPathologyEvent curie:tnmN ?TumorPathologyEvent_tnmN } ${TumorPathologyEvent_tnmN!} </#if>
    <#if fetch || TumorPathologyEvent_tnmM??>            OPTIONAL { ?TumorPathologyEvent curie:tnmM ?TumorPathologyEvent_tnmM } ${TumorPathologyEvent_tnmM!} </#if>
  <#if !has_event_filter>}</#if>
</#if>

?Sample a curie:BiologicalSample .
FILTER NOT EXISTS { ?Sample fs:dateDeleted ?anyDateDeleted }
}
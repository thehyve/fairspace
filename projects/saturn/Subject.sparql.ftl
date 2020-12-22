PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX curie: <https://institut-curie.org/ontology#>
PREFIX fs:    <http://fairspace.io/ontology#>

<#if fetch>
SELECT ?Subject ?Subject_species ?Subject_gender ?Subject_ageAtLastNews ?Subject_ageAtDeath
<#else>
SELECT ?Subject
</#if>
WHERE {
<#if fetch>
VALUES ?Subject { ${iris} }
<#elseif Collection_collection?? || Collection_analysisType??>
{
  SELECT DISTINCT ?s WHERE {
     <#if Collection_collection??> ?Collection_collection a fs:Collection . ${Collection_collection}  ?file (fs:belongsTo)* ?Collection_collection . </#if>
     ?file curie:aboutSubject ?s .
     <#if Collection_analysisType??> ?Collection curie:analysisType ?Collection_analysisType . ${Collection_analysisType}</#if>
  }
}
BIND(?s AS ?Subject)
</#if>

?Subject a curie:Subject .

<#if Sample_topography?? || Sample_nature?? || Sample_origin?? || Sample_tumorCellularity??>
FILTER EXISTS {
  ?Sample curie:subject ?Subject .
  <#if Sample_topography??> ?Sample curie:topography ?Sample_topography . ${Sample_topography} </#if>
  <#if Sample_nature??>     ?Sample curie:isOfNature ?Sample_nature . ${Sample_nature} </#if>
  <#if Sample_origin??>     ?Sample curie:hasOrigin ?Sample_origin . ${Sample_origin} </#if>
  <#if Sample_tumorCellularity??> ?Sample curie:tumorCellularity ?Sample_tumorCellularity . ${Sample_tumorCellularity} </#if>
}
</#if>

<#if TumorPathologyEvent_morphology?? || TumorPathologyEvent_eventType?? || TumorPathologyEvent_topography?? || TumorPathologyEvent_laterality?? || TumorPathologyEvent_ageAtDiagnosis?? || TumorPathologyEvent_tumorGradeType?? || TumorPathologyEvent_tumorGradeValue?? || TumorPathologyEvent_tnmType?? || TumorPathologyEvent_tnmT?? || TumorPathologyEvent_tnmN?? || TumorPathologyEvent_tnmTM??>
FILTER EXISTS {
  ?TumorPathologyEvent curie:eventSubject ?Subject .
  <#if TumorPathologyEvent_morphology??>      ?TumorPathologyEvent curie:tumorMorphology ?TumorPathologyEvent_morphology . ${TumorPathologyEvent_morphology} </#if>
  <#if TumorPathologyEvent_eventType??>       ?TumorPathologyEvent curie:eventType ?TumorPathologyEvent_eventType . ${TumorPathologyEvent_eventType} </#if>
  <#if TumorPathologyEvent_topography??>      ?TumorPathologyEvent curie:topography ?TumorPathologyEvent_topography . ${TumorPathologyEvent_topography} </#if>
  <#if TumorPathologyEvent_laterality??>      ?TumorPathologyEvent curie:tumorLaterality ?TumorPathologyEvent_laterality . ${TumorPathologyEvent_laterality} </#if>
  <#if TumorPathologyEvent_ageAtDiagnosis??>  ?TumorPathologyEvent curie:ageAtDiagnosis ?TumorPathologyEvent_ageAtDiagnosis . ${TumorPathologyEvent_ageAtDiagnosis} </#if>
  <#if TumorPathologyEvent_tumorGradeType??>  ?TumorPathologyEvent curie:tumorGradeType ?TumorPathologyEvent_tumorGradeType . ${TumorPathologyEvent_tumorGradeType} </#if>
  <#if TumorPathologyEvent_tumorGradeValue??> ?TumorPathologyEvent curie:tumorGradeValue ?TumorPathologyEvent_tumorGradeValue . ${TumorPathologyEvent_tumorGradeValue} </#if>
  <#if TumorPathologyEvent_tnmType??>         ?TumorPathologyEvent curie:tnmType ?TumorPathologyEvent_tnmType . ${TumorPathologyEvent_tnmType} </#if>
  <#if TumorPathologyEvent_tnmT??>            ?TumorPathologyEvent curie:tnmT ?TumorPathologyEvent_tnmT . ${TumorPathologyEvent_tnmT} </#if>
  <#if TumorPathologyEvent_tnmN??>            ?TumorPathologyEvent curie:tnmN ?TumorPathologyEvent_tnmN . ${TumorPathologyEvent_tnmN} </#if>
  <#if TumorPathologyEvent_tnmM??>            ?TumorPathologyEvent curie:tnmM ?TumorPathologyEvent_tnmM . ${TumorPathologyEvent_tnmM} </#if>
}
</#if>

<#if fetch || Subject_species??>
OPTIONAL { ?Subject curie:isOfSpecies ?Subject_species } ${Subject_species!}
</#if>
<#if fetch || Subject_gender??>
OPTIONAL { ?Subject curie:isOfGender ?Subject_gender } ${Subject_gender!}
</#if>
<#if fetch || Subject_ageAtLastNews??>
OPTIONAL { ?Subject curie:ageAtLastNews ?Subject_ageAtLastNews } ${Subject_ageAtLastNews!}
</#if>
<#if fetch || Subject_ageAtDeath??>
OPTIONAL { ?Subject curie:ageAtDeath ?Subject_ageAtDeath } ${Subject_ageAtDeath!}
</#if>

FILTER NOT EXISTS { ?Subject fs:dateDeleted ?anyDateDeleted }
}
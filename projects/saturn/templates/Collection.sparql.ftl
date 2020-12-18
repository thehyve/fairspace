PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX curie: <https://institut-curie.org/ontology#>
PREFIX fs:    <http://fairspace.io/ontology#>
<#if fetch>
SELECT DISTINCT ?Collection ?Collection_type ?Collection_collection ?Collection_workspace ?Collection_dateCreated ?Collection_dateModified ?Collection_analysisType
<#else>
SELECT DISTINCT ?Collection
</#if>
WHERE {
<#if fetch>
VALUES ?Collection { ${iris} }
<#elseif Collection_collection??>
{
  SELECT ?f WHERE {
     ?Collection_collection a fs:Collection . ${Collection_collection}  ?f (fs:belongsTo)* ?Collection_collection
  }
}
BIND(?f AS ?Collection)
</#if>
?Collection a ?Collection_type .
<#if !fetch>FILTER ((?Collection_type = fs:File) || (?Collection_type = fs:Directory) || (?Collection_type = fs:Collection))</#if>
<#if Collection??> ${Collection}</#if>
<#if Collection_type??> ${Collection_type}</#if>
<#if fetch || Collection_analysisType??> OPTIONAL { ?Collection curie:analysisType ?Collection_analysisType } ${Collection_analysisType!}</#if>
<#if fetch>
  ?Collection (fs:belongsTo)* ?Collection_collection . ?Collection_collection fs:ownedBy ?Collection_workspace .
  OPTIONAL {?Collection fs:dateCreated ?Collection_dateCreated}
  OPTIONAL {?Collection fs:dateModified ?Collection_dateModified}
<#else>
  <#if Sample_topography?? || Sample_nature?? || Sample_origin?? || Sample_tumorCellularity??>
    FILTER EXISTS {
      ?Collection curie:sample ?Sample .
      <#if Sample_topography??> ?Sample curie:topography ?Sample_topography . ${Sample_topography} </#if>
      <#if Sample_nature??>     ?Sample curie:isOfNature ?Sample_nature . ${Sample_nature} </#if>
      <#if Sample_origin??>     ?Sample curie:hasOrigin ?Sample_origin . ${Sample_origin} </#if>
      <#if Sample_tumorCellularity??> ?Sample curie:tumorCellularity ?Sample_tumorCellularity . ${Sample_tumorCellularity} </#if>
      <#if TumorPathologyEvent_morphology?? || TumorPathologyEvent_eventType?? || TumorPathologyEvent_topography?? || TumorPathologyEvent_laterality?? || TumorPathologyEvent_ageAtDiagnosis?? || TumorPathologyEvent_tumorGradeType?? || TumorPathologyEvent_tumorGradeValue?? || TumorPathologyEvent_tnmType?? || TumorPathologyEvent_tnmT?? || TumorPathologyEvent_tnmN?? || TumorPathologyEvent_tnmTM??>
        ?Sample curie:diagnosis ?TumorPathologyEvent .
        <#if TumorPathologyEvent_morphology??>      ?TumorPathologyEvent curie:tumorMorphology ?TumorPathologyEvent_morphology . ${TumorPathologyEvent_morphology} </#if>
        <#if TumorPathologyEvent_eventType??>       ?TumorPathologyEvent curie:eventType ?TumorPathologyEvent_eventType . ${TumorPathologyEvent_eventType} </#if>
        <#if TumorPathologyEvent_tumorTopography??> ?TumorPathologyEvent curie:topography ?TumorPathologyEvent_tumorTopography . ${TumorPathologyEvent_tumorTopography} </#if>
        <#if TumorPathologyEvent_laterality??>      ?TumorPathologyEvent curie:tumorLaterality ?TumorPathologyEvent_laterality . ${TumorPathologyEvent_laterality} </#if>
        <#if TumorPathologyEvent_ageAtDiagnosis??>  ?TumorPathologyEvent curie:ageAtDiagnosis ?TumorPathologyEvent_ageAtDiagnosis . ${TumorPathologyEvent_ageAtDiagnosis} </#if>
        <#if TumorPathologyEvent_tumorGradeType??>  ?TumorPathologyEvent curie:tumorGradeType ?TumorPathologyEvent_tumorGradeType . ${TumorPathologyEvent_tumorGradeType} </#if>
        <#if TumorPathologyEvent_tumorGradeValue??> ?TumorPathologyEvent curie:tumorGradeValue ?TumorPathologyEvent_tumorGradeValue . ${TumorPathologyEvent_tumorGradeValue} </#if>
        <#if TumorPathologyEvent_tnmType??>         ?TumorPathologyEvent curie:tnmType ?TumorPathologyEvent_tnmType . ${TumorPathologyEvent_tnmType} </#if>
        <#if TumorPathologyEvent_tnmT??>            ?TumorPathologyEvent curie:tnmT ?TumorPathologyEvent_tnmT . ${TumorPathologyEvent_tnmT} </#if>
        <#if TumorPathologyEvent_tnmN??>            ?TumorPathologyEvent curie:tnmN ?TumorPathologyEvent_tnmN . ${TumorPathologyEvent_tnmN} </#if>
        <#if TumorPathologyEvent_tnmM??>            ?TumorPathologyEvent curie:tnmM ?TumorPathologyEvent_tnmM . ${TumorPathologyEvent_tnmM} </#if>
      </#if>
      <#if Subject_species?? || Subject_gender?? || Subject_ageAtLastNews?? || Subject_ageAtDeath??>
         ?Sample curie:subject ?Subject .
         <#if Subject_species??> ?Subject curie:isOfSpecies ?Subject_species . ${Subject_species}</#if>
         <#if Subject_gender??> ?Subject curie:isOfGender ?Subject_gender . ${Subject_gender}</#if>
         <#if Subject_ageAtLastNews??> ?Subject curie:ageAtLastNews ?Subject_ageAtLastNews . ${Subject_ageAtLastNews}</#if>
         <#if Subject_ageAtDeath??> ?Subject curie:ageAtDeath ?Subject_ageAtDeath . ${Subject_ageAtDeath}</#if>
      </#if>
     }
  <#elseif TumorPathologyEvent_morphology?? || TumorPathologyEvent_eventType?? || TumorPathologyEvent_topography?? || TumorPathologyEvent_laterality?? || TumorPathologyEvent_ageAtDiagnosis?? || TumorPathologyEvent_tumorGradeType?? || TumorPathologyEvent_tumorGradeValue?? || TumorPathologyEvent_tnmType?? || TumorPathologyEvent_tnmT?? || TumorPathologyEvent_tnmN?? || TumorPathologyEvent_tnmTM??>
    FILTER EXISTS {
      ?Collection curie:aboutEvent ?TumorPathologyEvent .
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
      <#if Subject_species?? || Subject_gender?? || Subject_ageAtLastNews?? || Subject_ageAtDeath??>
         ?event curie:eventSubject ?Subject .
         <#if Subject_species??> ?subject curie:isOfSpecies ?Subject_species . ${Subject_species}</#if>
         <#if Subject_gender??> ?subject curie:isOfGender ?Subject_gender . ${Subject_gender}</#if>
         <#if Subject_ageAtLastNews??> ?subject curie:ageAtLastNews ?Subject_ageAtLastNews . ${Subject_ageAtLastNews}</#if>
         <#if Subject_ageAtDeath??> ?subject curie:ageAtDeath ?Subject_ageAtDeath . ${Subject_ageAtDeath}</#if>
      </#if>
    }
  <#elseif Subject_species?? || Subject_gender?? || Subject_ageAtLastNews?? || Subject_ageAtDeath??>
    FILTER EXISTS {
      ?Collection curie:aboutSubject ?Subject .
      <#if Subject_species??> ?Subject curie:isOfSpecies ?Subject_species . ${Subject_species}</#if>
      <#if Subject_gender??> ?Subject curie:isOfGender ?Subject_gender . ${Subject_gender}</#if>
      <#if Subject_ageAtLastNews??> ?Subject curie:ageAtLastNews ?Subject_ageAtLastNews . ${Subject_ageAtLastNews}</#if>
      <#if Subject_ageAtDeath??> ?Subject curie:ageAtDeath ?Subject_ageAtDeath . ${Subject_ageAtDeath}</#if>
    }
  </#if>
</#if>
}

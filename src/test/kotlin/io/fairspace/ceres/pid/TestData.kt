package io.fairspace.ceres.pid

import io.fairspace.ceres.pid.model.Pid
import java.util.*

object TestData {
   val uuid1: UUID = UUID.fromString("a20b7b1b-ac72-4074-9134-3a4672ad0eb6")
   val uuid2: UUID = UUID.fromString("da6d233b-5a15-4d8e-8895-e9ed6694299a")
   val uuid3: UUID = UUID.fromString("d7a7872c-7796-45ec-bec3-42b9cca60671")
   val commonPrefix: String = "https://workspace.test.fairway.app/iri/collections/123"
   val file1: String = "${commonPrefix}/foo/bar"
   val file2: String = "${commonPrefix}/foo/baz"
   val file3: String = "https://workspace.test.fairway.app/iri/collections/456/foo/bar"
   val nonExistingValue: String = "https://workspace.test.fairway.app/iri/collections/1010/foo/bar"
   val path1 = Pid( uuid = uuid1 , value = file1 )
   val path2 = Pid( uuid = uuid2 , value = file2 )
   val path3 = Pid( uuid = uuid3 , value = file3 )
   val deleteTestPrefix = "https://workspace.test.fairway.app/iri/collections/42"
   val deleteTestValue1 = "${deleteTestPrefix}/file1"
   val deleteTestValue2 = "${deleteTestPrefix}/file2"
   val updateTestOldPrefix = "https://workspace.test.fairway.app/iri/collections/31415"
   val updateTestOldValue1 = "${updateTestOldPrefix}/file1"
   val updateTestOldValue2 = "${updateTestOldPrefix}/file2"
   val updateTestNewPrefix = "https://workspace.test.fairway.app/iri/collections/27183"
   val updateTestNewValue1 = "${updateTestNewPrefix}/file1"
   val updateTestNewValue2 = "${updateTestNewPrefix}/file2"
}
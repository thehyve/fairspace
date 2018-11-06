package io.fairspace.ceres.pid

import io.fairspace.ceres.pid.model.Pid
import java.util.*

object TestData {
   val uuid1: UUID = UUID.fromString("a20b7b1b-ac72-4074-9134-3a4672ad0eb6")
   val uuid2: UUID = UUID.fromString("da6d233b-5a15-4d8e-8895-e9ed6694299a")
   val commonPrefix: String = "https://workspace.test.fairway.app/iri/collections/123"
   val file1: String = "${commonPrefix}/foo/bar"
   val file2: String = "${commonPrefix}/foo/baz"
   val nonExistingValue: String = "https://workspace.test.fairway.app/iri/collections/1010/foo/bar"
   val path1 = Pid( uuid = uuid1 , value = file1 )
   val path2 = Pid( uuid = uuid2 , value = file2 )
   val deleteTestPrefix = "https://workspace.test.fairway.app/iri/collections/42"
   val updateTestNewPrefix = "https://workspace.test.fairway.app/iri/collections/27183"
}
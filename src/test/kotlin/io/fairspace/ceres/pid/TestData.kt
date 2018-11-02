package io.fairspace.ceres.pid

import io.fairspace.ceres.pid.model.Pid
import java.util.*

object TestData {
   val uuid1: UUID = UUID.fromString("a20b7b1b-ac72-4074-9134-3a4672ad0eb6")
   val uuid2: UUID = UUID.fromString("da6d233b-5a15-4d8e-8895-e9ed6694299a")
   val uuid3: UUID = UUID.fromString("d7a7872c-7796-45ec-bec3-42b9cca60671")
   val file1: String = "https://workspace.test.fairway.app/iri/collections/123/foo/bar"
   val file2: String = "https://workspace.test.fairway.app/iri/collections/123/foo/baz"
   val file3: String = "https://workspace.test.fairway.app/iri/collections/456/foo/bar"
   val path1 = Pid( uuid = uuid1 , uri = file1 )
   val path2 = Pid( uuid = uuid2 , uri = file2 )
   val path3 = Pid( uuid = uuid3 , uri = file3 )


}
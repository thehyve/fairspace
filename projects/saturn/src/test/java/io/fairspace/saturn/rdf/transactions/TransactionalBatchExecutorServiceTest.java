package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.util.BatchExecutorService;
import org.junit.Test;

public class TransactionalBatchExecutorServiceTest {
  @Test
    public void test() throws InterruptedException {
      var e = new BatchExecutorService();
      Thread.currentThread().join();
  }
}
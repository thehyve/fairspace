package io.fairspace.saturn.rdf.transactions;

import org.junit.Ignore;

@Ignore
public class TxnLogDatasetGraphTest {
//    private List<TransactionRecord> transactions;
//    private Dataset ds;
//    private static final Statement statement = createStatement(createResource("http://example.com/s1"),
//            createProperty("http://example.com/p1"),
//            createPlainLiteral("blah"));
//
//    @Before
//    public void before() {
//        transactions = new ArrayList<>();
//        var transactionLog = new TransactionLog() {
//
//            @Override
//            public void log(TransactionRecord transaction) throws IOException {
//                transactions.add(transaction);
//            }
//
//            @Override
//            public long size() throws IOException {
//                return transactions.size();
//            }
//
//            @Override
//            public TransactionRecord get(long index) throws IOException {
//                return transactions.get((int) index);
//            }
//        };
//        ds = DatasetFactory.wrap(new TxnLogDatasetGraph(createTxnMem(), transactionLog, null, null));
//    }
//
//
//    @Test
//    public void shouldLogNonEmptyWriteTransactions() {
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").add(statement));
//
//        assertEquals(1, transactions.size());
//        assertEquals(1, transactions.get(0).getAdded().size());
//        assertEquals(0, transactions.get(0).getDeleted().size());
//        assertEquals(new Quad(createURI("http://example.com/g1"), statement.asTriple()), transactions.get(0).getAdded().iterator().next());
//
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").remove(statement));
//
//        assertEquals(2, transactions.size());
//        assertEquals(0, transactions.get(1).getAdded().size());
//        assertEquals(1, transactions.get(1).getDeleted().size());
//        assertEquals(new Quad(createURI("http://example.com/g1"), statement.asTriple()), transactions.get(1).getDeleted().iterator().next());
//
//    }
//
//    @Test
//    public void shouldNotLogEmptyWriteTransactions() {
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").add(statement).remove(statement));
//        assertEquals(0, transactions.size());
//    }
//
//    @Test
//    public void onlyRealChangesAreRecorded() {
//        // Removing a non-existing statement
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").remove(statement));
//        assertEquals(0, transactions.size());
//
//        // Adding same statement twice
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").add(statement));
//        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1").add(statement));
//        assertEquals(1, transactions.size());
//    }
}
import org.apache.jena.query.DatasetFactory.createTxnMem
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.CountDownLatch
import kotlin.concurrent.thread

class TransactionTest {
    private val model = createTxnMem().defaultModel
    private val NS = "http://fairspace.io/ontology#"
    private val sample = model.createResource(NS + "sample")
    private val subject = model.createResource(NS + "subject")
    private val derivesFrom = model.createProperty(NS, "derivesFrom")
    private val provides = model.createProperty(NS, "providesMaterial")


    @Test
    fun `Jena inference respects transaction rollbacks`() {
        model.begin()
        model.add(sample, derivesFrom, subject)
        assertTrue(model.contains(sample, derivesFrom, subject))
        model.abort()

        model.begin()
        assertFalse(model.contains(sample, derivesFrom, subject))
        model.abort()
    }

    @Test
    fun `Jena inference respects transaction boundaries`() {
        val statementAdded = CountDownLatch(1)
        val firstTransactionCanBeCommitted = CountDownLatch(1)
        val firstTransactionIsCommitted = CountDownLatch(1)

        thread {
            model.executeInTxn {
                model.add(sample, derivesFrom, subject)
                assertTrue(model.contains(sample, derivesFrom, subject))
                statementAdded.countDown()
                firstTransactionCanBeCommitted.await()
            }

            firstTransactionIsCommitted.countDown()
        }

        model.calculateInTxn {
            statementAdded.await()
            assertFalse(model.listStatements().toModel().contains(sample, derivesFrom, subject))
        }

        firstTransactionCanBeCommitted.countDown()
        firstTransactionIsCommitted.await()

        model.calculateInTxn {
            assertTrue(model.contains(sample, derivesFrom, subject))
        }
    }
}

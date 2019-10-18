package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.validation.ValidationEngine;

import java.util.ArrayList;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static java.lang.Math.min;
import static java.lang.Thread.currentThread;
import static java.util.concurrent.Executors.newFixedThreadPool;
import static org.eclipse.jetty.util.ProcessorUtils.availableProcessors;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {
    private static final int NUM_THREADS = availableProcessors();
    private final ExecutorService executorService = newFixedThreadPool(NUM_THREADS);

    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler, RDFConnection rdf) {
        var affectedNodes = removed.listSubjects()
                .andThen(added.listSubjects())
                .mapWith(FrontsNode::asNode)
                .toSet();
        if (affectedNodes.isEmpty()) {
            return;
        }
        var nodeQueue = new ArrayBlockingQueue<>(affectedNodes.size(), false, affectedNodes);
        var futures = new ArrayList<Future<ValidationEngine>>();
        var numberOfTasks = min(NUM_THREADS, nodeQueue.size());
        for (int i = 0; i < numberOfTasks; i++) {
            var validationEngine = createEngine(after, vocabulary); // must be on the main thread
            futures.add(executorService.submit(() -> {
                Node node;
                while ((node = nodeQueue.poll()) != null) {
                    validationEngine.validateNode(node);
                }
                return validationEngine;
            }));
        }

        try {
            for (var future : futures) {
                getViolations(future.get(), violationHandler);
            }
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new RuntimeException("SHACL validation was interrupted", e);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }
}

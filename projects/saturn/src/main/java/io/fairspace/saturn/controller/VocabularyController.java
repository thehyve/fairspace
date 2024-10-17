package io.fairspace.saturn.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static io.fairspace.saturn.services.metadata.Serialization.getFormat;
import static io.fairspace.saturn.services.metadata.Serialization.serialize;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;

@RestController
@RequestMapping("/vocabulary")
public class VocabularyController {

    @GetMapping("/")
    public ResponseEntity<String> getVocabulary(
            @RequestHeader(value = HttpHeaders.ACCEPT, required = false) String acceptHeader) {
        var format = getFormat(acceptHeader);
        var contentType = format.getLang().getHeaderString();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        var vocabulary = serialize(VOCABULARY, format);
        return new ResponseEntity<>(vocabulary, headers, HttpStatus.OK);
    }
}

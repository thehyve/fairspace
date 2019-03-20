package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.auth.UserInfo;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Collections;
import java.util.Set;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class DataStewardAccessValidatorTest {
    private static final String dataStewardRole = "data-steward";
    private static final UserInfo DATASTEWARD = new UserInfo(
            "data-steward",
            "data-steward",
            "Data Steward",
            "datasteward@fairspace.com",
            Set.of("other-role", dataStewardRole, "additional-role")
    );

    private static final UserInfo REGULAR_USER = new UserInfo(
            "regular-user",
            "regular-user",
            "Regular User",
            "user@fairspace.com",
            Set.of("other-role", "additional-role")
    );

    private UserInfo currentUser;
    private DataStewardAccessValidator dataStewardAccessValidator;

    @Before
    public void setUp() throws Exception {
        dataStewardAccessValidator = new DataStewardAccessValidator(dataStewardRole, () -> currentUser);
    }

    @Test
    public void testDataStewardIsValid() {
        currentUser = DATASTEWARD;

        assertEquals(ValidationResult.VALID, dataStewardAccessValidator.validatePut(null));
        assertEquals(ValidationResult.VALID, dataStewardAccessValidator.validatePatch(null));
        assertEquals(ValidationResult.VALID, dataStewardAccessValidator.validateDelete(null));
        assertEquals(ValidationResult.VALID, dataStewardAccessValidator.validateDelete(null, null, null));
    }

    @Test
    public void testRegularUserIsInvalid() {
        currentUser = REGULAR_USER;

        assertFalse(dataStewardAccessValidator.validatePut(null).isValid());
        assertFalse(dataStewardAccessValidator.validatePatch(null).isValid());
        assertFalse(dataStewardAccessValidator.validateDelete(null).isValid());
        assertFalse(dataStewardAccessValidator.validateDelete(null, null, null).isValid());
    }

    @Test
    public void testNoUserInfoMeansInvalid() {
        currentUser = null;

        assertFalse(dataStewardAccessValidator.validatePut(null).isValid());
    }
}

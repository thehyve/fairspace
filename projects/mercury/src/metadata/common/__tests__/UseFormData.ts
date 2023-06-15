// @ts-nocheck
import { act } from "react-dom/test-utils";
import { SHACL_MAX_LENGTH, SHACL_MIN_COUNT } from "../../../constants";
import useFormData from "../UseFormData";
import { testHook } from "../../../common/utils/testUtils";
const initialValues = {
  'http://a': [{
    value: 'text'
  }, {
    value: 'something'
  }],
  'http://b': [{
    value: 'xyz'
  }]
};
let formData;
beforeEach(() => {
  testHook(() => {
    formData = useFormData(initialValues);
  });
});
describe('useFormData', () => {
  const propertyA = {
    key: 'http://a',
    shape: {
      [SHACL_MIN_COUNT]: [{
        '@value': 2
      }]
    }
  };
  const propertyB = {
    key: 'http://b',
    shape: {
      [SHACL_MAX_LENGTH]: [{
        '@value': 5
      }]
    }
  };
  describe('initial state', () => {
    it('should be valid by default', () => {
      expect(formData.isValid).toBe(true);
    });
    it('should return initial values by default', () => {
      expect(formData.valuesWithUpdates).toEqual(initialValues);
    });
    it('should initialize without updates', () => {
      expect(formData.hasFormUpdates).toBe(false);
      expect(formData.updates).toEqual({});
    });
  });
  describe('data manipulation', () => {
    it('should add new values', () => {
      act(() => {
        formData.addValue(propertyA, {
          value: 'added'
        });
      });
      expect(formData.updates).toEqual({
        'http://a': [{
          value: 'text'
        }, {
          value: 'something'
        }, {
          value: 'added'
        }]
      });
    });
    it('should allow updating existing values', () => {
      act(() => {
        formData.updateValue(propertyA, {
          value: 'replaced'
        }, 1);
      });
      expect(formData.updates).toEqual({
        'http://a': [{
          value: 'text'
        }, {
          value: 'replaced'
        }]
      });
    });
    it('should allow deleting existing values', () => {
      act(() => {
        formData.deleteValue(propertyA, 1);
      });
      expect(formData.updates).toEqual({
        'http://a': [{
          value: 'text'
        }]
      });
    });
    it('should allow deleting added values', () => {
      act(() => {
        formData.addValue(propertyA, {
          value: 'added'
        });
      });
      act(() => {
        formData.addValue(propertyA, {
          value: 'another added'
        });
      });
      act(() => {
        formData.deleteValue(propertyA, 3);
      });
      expect(formData.updates).toEqual({
        'http://a': [{
          value: 'text'
        }, {
          value: 'something'
        }, {
          value: 'added'
        }]
      });
    });
    it('should reset the form after deleting all added values', () => {
      act(() => {
        formData.addValue(propertyA, {
          value: 'added'
        });
        formData.deleteValue(propertyA, 2);
      });
      expect(formData.updates).toEqual({});
    });
  });
  describe('validation', () => {
    it('should validate data upon adding', () => {
      act(() => {
        formData.addValue(propertyB, {
          value: 'more-than-5-characters'
        });
      });
      expect(Object.keys(formData.validationErrors)).toEqual(["http://b"]);
    });
    it('should validate data upon updating', () => {
      act(() => {
        formData.updateValue(propertyB, {
          value: 'more-than-5-characters'
        }, 0);
      });
      expect(Object.keys(formData.validationErrors)).toEqual(["http://b"]);
    });
    it('should validate data upon deletion', () => {
      act(() => {
        formData.deleteValue(propertyA, 0);
      });
      expect(Object.keys(formData.validationErrors)).toEqual(["http://a"]);
    });
  });
});
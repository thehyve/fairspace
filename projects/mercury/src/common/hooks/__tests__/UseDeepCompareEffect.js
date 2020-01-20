import {renderHook} from '@testing-library/react-hooks';
import useDeepCompareEffect from "../UseDeepCompareEffect";

describe('UseDeepCompareEffect', () => {
    const callback = jest.fn();

    it('properly handles callbacks', () => {
        let dependencies = [1, {a: 'b'}, 'test', false];
        const {rerender} = renderHook(() => useDeepCompareEffect(callback, dependencies));

        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // dependencies not changed
        rerender();
        expect(callback).toHaveBeenCalledTimes(0);
        callback.mockClear();

        // dependencies are a new object with same values
        dependencies = [1, {a: 'b'}, 'test', false];
        rerender();
        expect(callback).toHaveBeenCalledTimes(0);
        callback.mockClear();

        // numeric dependency changed
        dependencies = [2, {a: 'b'}, 'test', false];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // textual dependency changed
        dependencies = [2, {a: 'b'}, 'test2', false];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // object dependency changed
        dependencies = [2, {a: 'bb'}, 'test2', false];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();
    });

    it('properly handles callbacks with dependencies of array type', () => {

        let dependencies = [1, [{x: 1}, {y: 'z'}], true];
        const {rerender} = renderHook(() => useDeepCompareEffect(callback, dependencies));

        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // dependencies not changed
        rerender();
        expect(callback).toHaveBeenCalledTimes(0);
        callback.mockClear();

        // dependencies are a new object with same values
        dependencies = [1, [{x: 1}, {y: 'z'}], true];
        rerender();
        expect(callback).toHaveBeenCalledTimes(0);
        callback.mockClear();

        // array dependency changes
        dependencies = [1, [{x: 2}, {y: 'z'}], true];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // array dependency changes
        dependencies = [1, [{x: 2}, {y: 'zz'}], true];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // array dependency changes
        dependencies = [1, [{x: 2}, {y: 'zz'}, {z: 'new'}], true];
        rerender();
        expect(callback).toHaveBeenCalledTimes(1);
        callback.mockClear();

        // dependencies are the same
        dependencies = [1, [{x: 2}, {y: 'zz'}, {z: 'new'}], true];
        rerender();
        expect(callback).toHaveBeenCalledTimes(0);
        callback.mockClear();
    });
});

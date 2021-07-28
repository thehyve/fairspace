import {limitLines, shortenText} from '../ShortText';

describe('ShortText', () => {
    it('should correctly shorten', () => {
        expect(shortenText("Example", 10)).toBe("Example");
        expect(shortenText("Extra text has been removed", 10)).toBe("Extra text");
        expect(shortenText("Extra text    has been removed", 10)).toBe("Extra text");
        expect(shortenText("Example text", 10)).toBe("Example");
        expect(shortenText("E andnowaverylongword", 10)).toBe("E");
        expect(shortenText("Justaverywaytoolongword", 10)).toBe("");
    })
    it('should correctly limit lines', () => {
        expect(limitLines("This fits\nperfectly.", 2)).toBe("This fits\nperfectly.");
        expect(limitLines("Just trims\nthe new line\n", 2)).toBe("Just trims\nthe new line");
        expect(limitLines("These are\nway too\nmany lines\nof text.", 2)).toBe("These are\nway too");
    })
});

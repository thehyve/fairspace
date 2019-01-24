package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.apache.commons.lang.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Represents a filesize
 */
public class FileSize {
    /**
     * Parse the filesize as described by the https://schema.org/fileSize predicate
     * @param fileSize
     * @return filesize in bytes
     * @throws NumberFormatException in case the number could not be parsed to long
     * @throws IllegalArgumentException in case the unit is unknown
     * @see {https://schema.org/fileSize}
     */
    public static long parse(String fileSize)  {
        if(fileSize == null) {
            return 0;
        }

        fileSize = fileSize.trim();
        if(StringUtils.isEmpty(fileSize)) {
            return 0;
        }

        // Split the string into only numbers and only characters
        Pattern re = Pattern.compile("^(\\d+)(\\D+)?$");
        Matcher matcher = re.matcher(fileSize);

        // If no match could be found, the format is incorrect
        if(!matcher.matches()) {
            throw new IllegalArgumentException("Could not parse filesize " + fileSize);
        }

        // See if we can determine the unit
        // If not given, the default is KB (see https://schema.org/fileSize)
        long value = Long.parseLong(matcher.group(1));
        FileSizeUnit unit = FileSizeUnit.KB;

        if(matcher.groupCount() > 1 && matcher.group(2) != null) {
            unit = FileSizeUnit.valueOf(matcher.group(2));
        }

        return value * unit.getMultiplier();
    }

    public static String format(long fileSize) {
        // TODO: Still to implement
        return "";
    }

    enum FileSizeUnit {
        B(0),
        KB(1),
        MB(2),
        GB(3),
        TB(4),
        PB(5),
        EB(6),
        ZB(7),
        YB(8);

        private final long multiplier;

        FileSizeUnit(int power) {
            multiplier = (long) Math.pow(1024, power);
        }

        public long getMultiplier() {
            return multiplier;
        }
    }
}

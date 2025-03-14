package com.fptgang.backend.util;

import java.text.DecimalFormat;

public class CurrencyUtil {
    private static final DecimalFormat DF = new DecimalFormat("#,###.00");

    public static String format(double amount) {
        return DF.format(amount);
    }

    public static String format(long amount) {
        return DF.format(amount);
    }

    public static String format(Object amount) {
        return DF.format(amount);
    }
}
package com.fptgang.backend.util;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;

import java.io.StringReader;
import java.io.StringWriter;

public class TemplateUtil {
    private static final MustacheFactory MF = new DefaultMustacheFactory();

    public static String render(String name, String template, Object data) {
        Mustache mustache = MF.compile(new StringReader(template), name);
        StringWriter writer = new StringWriter();
        mustache.execute(writer, data);
        return writer.toString();
    }
}

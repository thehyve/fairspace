package ludwig.ide;

import javax.swing.*;

import java.awt.*;

import static java.awt.BorderLayout.WEST;
import static javax.swing.SwingUtilities.invokeLater;
import static javax.swing.UIManager.getSystemLookAndFeelClassName;
import static javax.swing.UIManager.setLookAndFeel;
import static javax.swing.WindowConstants.EXIT_ON_CLOSE;

public class App {
    public static void main(String[] args) {
        invokeLater(() -> {
            try {
                setLookAndFeel(getSystemLookAndFeelClassName());
            } catch (Exception ignore) {
            }
            var frame = new JFrame("Ludwig");
            frame.setDefaultCloseOperation(EXIT_ON_CLOSE);
            var borderLayout = new BorderLayout();
//            frame.setLayout(borderLayout);
//            var splitPane = new JSplitPane();
            var editor = new JTextPane();
            frame.add(editor);
          //  frame.pack();
            frame.setVisible(true);
        });

    }
}

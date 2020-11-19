# CLion format README

The extension allows formatting c++ files using CLion's command-line interface.
https://www.jetbrains.com/help/clion/command-line-formatter.html

## Q&A

Q: What was this extension developed for?

A: If you have a CLion's formatting settings file, and you need to ensure that the code formatting in visual studio code is identical to how it is done in Clion you can use this tool. CLion IDE has the feature to export clion-codestyle.xml file to .clang-format file, however, this does not provide 100% identical formatting.

## Usage

1. Install an extension from the marketplace;
2. Set the extension settings;
3. Open the C ++ file in the editor, select "Format Document With ..." in the context menu, or select a code fragment and select "Format Selection With ..." in the context menu, then select "CLion format";
4. Standard shortcuts can be used for formatting.

## Features

- Made in accordance with the official guidelines: https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices;
- Allows you to edit the selected text or the whole file;
- You will have time to make yourself a coffee because it works slightly slowly :)

## Extension Settings

This extension contributes the following settings:

* `clion-formatter.executable`: clion executable path
* `clion-formatter.settings`: code style settings file path to use for formatting



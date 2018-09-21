class Clipboard {
    static CUT = 'cut';
    static COPY = 'copy';

    constructor(fileAPI) {
        this.fileAPI = fileAPI;
        this.clear();
    }

    cut(sourceDir, sourcePaths) {
        this.action = Clipboard.CUT;
        this.sourceDir = sourceDir;
        this.paths = sourcePaths;

        return this;
    }
    copy(sourceDir, sourcePaths) {
        this.action = Clipboard.COPY;
        this.sourceDir = sourceDir;
        this.paths = sourcePaths;

        return this;
    }

    paste(destinationDir) {
        if(!this.canPaste()) {
            return Promise.reject("Not able to paste");
        }

        if(this.action === Clipboard.CUT) {
            return this._movePaths(destinationDir);
        } else {
            return this._copyPaths(destinationDir);
        }
    }

    canPaste() {
        return (this.action === Clipboard.CUT || this.action === Clipboard.COPY) && this.paths.length > 0;
    }

    getNumItems() {
        return this.canPaste() ? this.paths.length : 0;
    }

    clear() {
        this.action = '';
        this.sourceDir = '';
        this.paths = [];

        return this;
    }

    _movePaths(destinationDir) {
        // Moving files to the current directory is a noop
        if(destinationDir === this.sourceDir) {
            return Promise.resolve();
        }

        return Promise.all(this.paths.map(path => {
            const sourceFile = this.fileAPI.joinPaths(this.sourceDir || '', path.basename);
            const destinationFile = this.fileAPI.joinPaths(destinationDir || '', path.basename);
            return this.fileAPI.move(sourceFile, destinationFile);
        }))
    }

    _copyPaths(destinationDir) {
        return Promise.all(this.paths.map(path => {
            const sourceFile = this.fileAPI.joinPaths(this.sourceDir || '', path.basename);
            let destinationFilename = path.basename;

            // Copying files to the current directory involves renaming
            if(destinationDir === this.sourceDir) {
                destinationFilename = this._addCounterToFilename(destinationFilename);
            }

            const destinationFile = this.fileAPI.joinPaths(destinationDir || '', destinationFilename);

            return this.fileAPI.copy(sourceFile, destinationFile);
        }))
    }

    _addCounterToFilename(filename) {
        // Parse the filename
        const dotPosition = filename.lastIndexOf('.');
        let basename = filename.substring(0, dotPosition);
        const extension = filename.substring(dotPosition + 1);

        // By default the counter is set to 2
        let counter = 2;

        // Verify if the filename already contains a counter
        // If so, update the counter in the filename
        const counterMatch = / \((\d+)\)$/;
        const matches = basename.match(counterMatch);
        if(matches) {
            basename = basename.substring(0, basename.length - matches[0].length);
            counter = parseInt(matches[1], 10) + 1;
        }

        return `${basename} (${counter}).${extension}`;
    }
}

export default Clipboard;

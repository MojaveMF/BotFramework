/* Hi */

// Imports
import FILE_SYSTEM, { fstat } from 'fs';
import path from 'path';
import PATH_NODE from 'path';

// Custom PATH OBJECT since i think node needs this
export class PathLocation {
  // Varibles
  PATH_STRING: string;
  VERBOSE: boolean;

  // Constructer
  constructor(PATH: string, VERBOSE?: boolean) {
    if (FILE_SYSTEM.existsSync(PATH_NODE.resolve(PATH))) {
      this.PATH_STRING = PATH_NODE.resolve(PATH);
    } else {
      throw new Error('Provided PATH dosent exist (CHECKED WITH FS)');
    }

    if (VERBOSE === true) {
      this.VERBOSE = true;
    } else {
      this.VERBOSE = false;
    }
  }

  // Class Functions

  Parent() {
    const DIRS: Array<string> = this.PATH_STRING.split(' ');

    const last: string = DIRS.pop()!;
    // Joins ARRAY Together
    const NEW_PATH = PATH_NODE.resolve(DIRS.join('/'));

    if (this.VERBOSE === true)
      console.log(`${last} REMOVED NEW PATH: ${NEW_PATH}`);

    this.PATH_STRING = NEW_PATH;
  }

  List() {
    return FILE_SYSTEM.readdirSync(this.PATH_STRING);
  }

  Exist(FileName: string) {
    const Files = this.List();

    if (Files.includes(FileName)) {
      return true;
    }
    return false;
  }

  Read(FileName: string) {
    return FILE_SYSTEM.readFileSync(PATH_NODE.join(this.PATH_STRING, FileName));
  }

  Save(FileName: string, Data: any) {
    return FILE_SYSTEM.writeFileSync(
      PATH_NODE.join(this.PATH_STRING, FileName),
      Data
    );
  }

  Enter(Folder: string) {
    this.PATH_STRING = path.resolve(this.PATH_STRING, Folder);
  }
}

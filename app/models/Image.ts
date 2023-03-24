import { Model } from "superflare";

export class Image extends Model {
  toJSON(): ImageRow {
    return super.toJSON();
  }
}

Model.register(Image);

export interface Image extends ImageRow {}

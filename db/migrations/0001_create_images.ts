import { Schema } from 'superflare';

export default function () {
  return Schema.create("images", (table) => {
    table.increments("id");
    table.string("url");
    table.string("format");
    table.integer("width");
    table.integer("height");
    table.integer("size");
    table.string("original_filename");
    table.timestamps();
  });
}
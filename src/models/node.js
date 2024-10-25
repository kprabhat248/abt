const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["operator", "operand"],
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    left: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
    },
    right: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
    },
  },
  { timestamps: true }
);

const Node = mongoose.model("Node", nodeSchema);
module.exports = Node;

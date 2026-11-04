import mongoose from 'mongoose';

const betaCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Beta-Code ist erforderlich'],
      unique: true,
      trim: true,
      uppercase: true, // Speichert Codes einheitlich in Großbuchstaben (z. B. BC-A1B2-C3D4)
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: 'Discord-Bot', // Dokumentiert die Herkunft (z. B. Discord-Admin-ID oder Bot)
    },
  },
  {
    timestamps: true, // Erzeugt automatisch createdAt und updatedAt
  }
);

const BetaCode = mongoose.model('BetaCode', betaCodeSchema);

export default BetaCode;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const playerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Benutzername ist erforderlich'],
      unique: true,
      trim: true,
      minlength: [3, 'Benutzername muss mindestens 3 Zeichen lang sein'],
    },
    password: {
      type: String,
      required: [true, 'Passwort ist erforderlich'],
      minlength: [6, 'Passwort muss mindestens 6 Zeichen lang sein'],
    },
    resources: {
      fragments: {
        type: Number,
        default: 100, // MVP-Startkapital
      },
      knowledge: {
        type: Number,
        default: 0,
      },
      credits: {
        type: Number,
        default: 0,
      },
    },
    buildings: {
      fragmentsCollector: {
        level: { type: Number, default: 0 },
      },
      dataNode: {
        level: { type: Number, default: 0 },
      },
      airPurifier: {
        level: { type: Number, default: 0 },
      },
      museum: {
        level: { type: Number, default: 0 },
      },
    },
    workers: {
      activeWorkers: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Passwort vor dem Speichern automatisch hashen
playerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methode zum Vergleichen von Passwörtern beim Login
playerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Player = mongoose.model('Player', playerSchema);

export default Player;

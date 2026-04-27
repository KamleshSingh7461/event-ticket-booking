import mongoose, { Schema, model, models } from 'mongoose';

const GlobalSettingsSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'billing_config' },
    billing: {
        companyName: { type: String, default: 'WYLDCARD STATS' },
        address: { type: String, default: '' },
        gstin: { type: String, default: '' },
        pan: { type: String, default: '' },
        cin: { type: String, default: '' },
        hsnCode: { type: String, default: '998599' },
        authorizedSignatory: { type: String, default: '' }, // URL to signature image
        logoUrl: { type: String, default: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png' },
        email: { type: String, default: 'ballislifesports3@gmail.com' },
        phone: { type: String, default: '' }
    },
    updatedAt: { type: Date, default: Date.now }
});

const GlobalSettings = models.GlobalSettings || model('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;

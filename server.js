import express from 'express'; 
import mongoose from 'mongoose'; 
import multer from 'multer'; 
import path from 'path'; 

const app = express(); 
const PORT = 3000; 
 

app.use(express.json()); 
app.use('/uploads', express.static('uploads')); 
 
// Connexion MongoDB 
mongoose.connect('mongodb://admin:password@localhost:27017', { 
    dbName: 'products_db' 
}); 
 
// Schéma Produit 
const productSchema = new mongoose.Schema({ 
    id: { type: String, required: true, unique: true }, 
    nom: { type: String, required: true }, 
    prix: { type: Number, required: true }, 
    image: String 
}); 
 
const Product = mongoose.model('Product', productSchema); 
 
// Configuration Multer 
const storage = multer.diskStorage({ 
    destination: 'uploads/', 
    filename: (req, file, cb) => { 
        cb(null, Date.now() + path.extname(file.originalname)); 
    } 
}); 
 
const upload = multer({ storage }); 
 
// Routes 
app.post('/api/products', upload.single('image'), async (req, res) => { 
    try { 
        const { id, nom, prix } = req.body; 
         
        const product = new Product({ 
            id, 
            nom, 
            prix: parseFloat(prix), 
            image: req.file?.filename 
        }); 
 
        await product.save(); 
        res.json({ message: 'Produit ajouté', product }); 
    } catch (error) { 
        res.status(400).json({ error: error.message }); 
    } 
}); 
 
app.get('/api/products', async (req, res) => { 
    const products = await Product.find(); 
    res.json(products); 
}); 
 
app.listen(PORT, () => { 
    console.log(`Serveur: http://localhost:${PORT}`); 
    console.log(`Mongo Express: http://localhost:8081`); 
}); 

// Servir les images statiquement 
app.use('/images', express.static('uploads')); 

// Endpoint alternatif avec contrôle 
app.get('/images/:nom', (req, res) => { 
const imagePath = path.join(__dirname, 'uploads', req.params.nom); 
res.sendFile(imagePath, (err) => { 
if (err) res.status(404).send('Image non trouvée'); 
}); 
}); 
app.listen(3000, () => console.log('🖼️  Serveur images: http://localhost:3000')); 
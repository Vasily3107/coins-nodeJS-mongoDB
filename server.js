const http = require('http');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:admin@cluster0.5ivypqw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.error("Connection error:", err));

const coinSchema = new mongoose.Schema({
         material : String,
             year : Number,
          country : String,
            value : Number,
    auction_price : Number
});
const Coin = mongoose.model('Note', coinSchema);

/*
__________ROUTE_TABLE____________________________________________________________
  method:   route:                 
  GET       /all_coins             
  GET       /coin_by_id            

  POST      /add_coin              

  PATCH     /update_coin_by_id     

  DELETE    /all_coins             
  DELETE    /delete_coin_by_id     
*/

const server = http.createServer(async (req, res) => {

    if (req.method === 'GET' && req.url === '/all_coins') {
        const coins = await Coin.find();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(coins));
    }

    else if (req.method === 'GET' && req.url === '/coin_by_id') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const kwargs = JSON.parse(body);

            const id = kwargs['id'];
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'id was NOT specified' }));
                return;
            }

            try {
                const tmp_coin = await Coin.findById(id);
                if (!tmp_coin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 'error': 'coin with such id was NOT found' }));
                    return;
                }
            }
            catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'invalid id format' }));
                return;
            }

            try {
                const coin = await Coin.findById(id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(coin));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'bad input', 'details': error }));
            }
        });
    }

    else if (req.method === 'POST' && req.url === '/add_coin') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const kwargs = JSON.parse(body);

            const      material = kwargs['material'];
            const          year = kwargs['year'];
            const       country = kwargs['country'];
            const         value = kwargs['value'];
            const auction_price = kwargs['auction_price'];

            let missing_kwargs = '[';

            if (!material)      missing_kwargs += 'material, ';
            if (!year)          missing_kwargs += 'year, ';
            if (!country)       missing_kwargs += 'country, ';
            if (!value)         missing_kwargs += 'value, ';
            if (!auction_price) missing_kwargs += 'auction_price, ';

            missing_kwargs = missing_kwargs.slice(0, -2) + ']';

            if (missing_kwargs.length > 1) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'some arguments are missing: ' + missing_kwargs }));
            }

            try {
                const newCoin = new Coin({ material, year, country, value, auction_price });
                await newCoin.save();
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'message': 'Coin was added', 'coin': newCoin }));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'bad input', 'details': error }));
            }
        });
    }

    else if (req.method === 'PATCH' && req.url === '/update_coin_by_id') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const kwargs = JSON.parse(body);

            const id = kwargs['id'];
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'id was NOT specified' }));
                return;
            }

            let oldCoin;
            try {
                oldCoin = await Coin.findById(id);
            }
            catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'invalid id format' }));
                return;
            }
            if (!oldCoin) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'coin with such id was NOT found' }));
                return;
            }

            const material      = kwargs['material']      || oldCoin.material;
            const year          = kwargs['year']          || oldCoin.year;
            const country       = kwargs['country']       || oldCoin.country;
            const value         = kwargs['value']         || oldCoin.value;
            const auction_price = kwargs['auction_price'] || oldCoin.auction_price;

            try {
                const newCoin = await Coin.findByIdAndUpdate(id, {
                                                                  material: material,
                                                                  year: year,
                                                                  country: country,
                                                                  value: value,
                                                                  auction_price: auction_price
                                                                 }, { new: true })
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'message': 'Coin was updated', 'coin': newCoin }));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'bad input', 'details': error }));
            }
        });
    }

    else if (req.method === 'DELETE' && req.url === '/all_coins') {
        await Coin.deleteMany();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 'message': 'all coins were deleted' }));
    }

    else if (req.method === 'DELETE' && req.url === '/delete_coin_by_id') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const kwargs = JSON.parse(body);

            const id = kwargs['id'];
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'id was NOT specified' }));
                return;
            }

            try {
                const tmp_coin = await Coin.findById(id);
                if (!tmp_coin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 'error': 'coin with such id was NOT found' }));
                    return;
                }
            }
            catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'invalid id format' }));
                return;
            }

            try {
                const deletedCoin = await Coin.findByIdAndDelete(id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'message': 'Coin was deleted', 'coin': deletedCoin }));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'bad input', 'details': error }));
            }
        });
    }

    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 'error': 'not found' }));
    }
});

const PORT = 12345;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// http://127.0.0.1:12345/

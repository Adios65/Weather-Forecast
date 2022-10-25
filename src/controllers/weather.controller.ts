import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { WeatherProvider, WttrObject } from '../interfaces';
import { TYPES } from '../types';

@injectable()
export class WeatherController {

    /*
    * Cette classe contient deux propriétés:
    *   _weatherService: service qui permet d'obtenir la météo d'une ville, voir l'interface WeatherProvider
    *   _defaultLocation: ville par défaut utilisée par le serveur si le client ne fourni pas de ville
    */
    public constructor(@inject(TYPES.WeatherService) private _weatherService: WeatherProvider,
        private _defaultLocation = 'paris') { /* empty */ }

    public get router(): Router {
        /*
        * Un Router est un regroupement isolé de middlewares.
        * Ce Router est associé à la route /weather.
        * https://expressjs.com/en/4x/api.html#router
        */
        const router: Router = Router();


        router.get('/now', async (req: Request, res: Response) => {

            if (typeof req.query.ville === 'string' && req.query.ville !== '') {
                console.log(req.query.ville);
                const query: string[] = req.query.ville.split(',');
                const wttrInfo: WttrObject[] = [];

                for (let i = 0; i < query.length; i++) {
                    wttrInfo.push(await this._weatherService.readWeather(query[i]));
                }
                res.render('index', { data: wttrInfo });

            }
            else {
                const wttrInfo: WttrObject[] = [await this._weatherService.readWeather(this._defaultLocation)];
                res.render('index', { data: wttrInfo });
            }
        });


        router.get('/hourly', async (req: Request, res: Response) => {
            //la variable wttrInfo contient la météo de Montréal (ville par défaut)
            if (typeof req.query.ville === 'string' && req.query.ville.charAt(0)) {
                const query: string[] = req.query.ville.split(',');
                const wttrInfo: WttrObject[] = [];

                for (let i = 0; i < query.length; i++) {
                    wttrInfo.push(await this._weatherService.readWeather(query[i]));
                }
                res.render('hourly', { data: wttrInfo });
            }
            else {
                const wttrInfo: WttrObject[] = [await this._weatherService.readWeather(this._defaultLocation)];
                res.render('hourly', { data: wttrInfo });
            }
        });
        router.get('/', async (req: Request, res: Response) => {
            res.redirect('/weather/now');
        });


        return router;
    }



}
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from 'express';
import * as logger from 'morgan';
import * as cors from 'cors';
import * as path from 'path';
import * as hbs from 'hbs';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { WeatherController } from './controllers/weather.controller';
import { handlebars } from 'hbs';

handlebars.registerHelper('formatDate', (d) =>  {
    let mois='';

    switch (d.substring(5,7)) {
    case '01':
        mois = 'Janvier';
        break;
    case '02':
        mois = 'Février';
        break;
    case '03':
        mois = 'Mars';
        break;
    case '04':
        mois = 'Avril';
        break;
    case '05':
        mois = 'Mai';
        break;
    case '06':
        mois = 'Juin';
        break;
    case '07':
        mois = 'Juillet';
        break;
    case '08':
        mois = 'Août';
        break;
    case '09':
        mois = 'Septembre';
        break;
    case '10':
        mois = 'Octobre';
        break;
    case '11':
        mois = 'Novembre';
        break;
    case '12':
        mois = 'Décembre';
        break;
    }
    const date = d.substring(8,10)+' '+mois+' '+d.substring(0,4);
    return date;
});

handlebars.registerHelper('formatHeure', (h) => {
    let str: any;
    switch (h) {
    case '0':
        str='Minuit';
        break;
    case '300':
        str='3h';
        break;
    case '600':
        str='6h';
        break;
    case '900':
        str='9h';
        break;
    case '1200':
        str='Midi';
        break;
    case '1500':
        str='15h';
        break;
    case '1800':
        str='18h';
        break;
    case '2100':
        str='21h';
        break;
    }
    return str;
});



@injectable()
export class Application {

    private readonly _internalError: number = 500;
    //Dossiers views et partials pour handlebars
    private readonly _viewsDir: string = path.join(__dirname, '..', 'templates', 'views');
    private readonly _partialsDir: string = path.join(__dirname, '..', 'templates', 'partials');
    public app: express.Application;

    public constructor(@inject(TYPES.WeatherController) private _weatherController: WeatherController) {

        this.app = express();

        this.config();

        this.bindRoutes();
    }

    private config(): void {
        //Configuration de Handlebars
        this.app.set('view engine', 'hbs');
        this.app.set('views', this._viewsDir);
        hbs.registerPartials(this._partialsDir);
        // Configuration des middlewares pour toutes les requêtes
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(cors());
        
        //Configuration du dossier public
        this.app.use(express.static(path.join(__dirname, '../public')));
    
    }
    public bindRoutes(): void {

        this.app.get('/',(req,res)  =>  {
            res.redirect('/weather');
        });
        
        // Le weather controller se charge des routes /weather/*
        this.app.use('/weather', this._weatherController.router);
       


        // En dernier lieu, on fait la gestion d'erreur 
        // si aucune route n'est trouvé
        this.errorHandeling();
    }

    private errorHandeling(): void {
        // Gestion des erreurs
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error('Not Found');
            next(err);
        });

        // Error handler en pour l'environnement de développement
        // Imprime le stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: any, req: express.Request, res: express.Response) => {
                res.status(err.status || this._internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // Error handler pour l'environnement de production
        this.app.use((err: any, req: express.Request, res: express.Response) => {
            res.status(err.status || this._internalError);
            res.send({
                message: err.message,
                error: {},
            });
        }); 

        
    }

}
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { WeatherProvider, WttrObject } from '../interfaces';
import { injectable } from 'inversify';
import fetch from 'node-fetch';




@injectable()
/*
* Cette classe a comme rôle de fournir la météo pour une
* ville demandée. Elle s'utilise comme le staticWeatherService.
* Cette classe fait la communication avec l'API de wttr
* les informations de météorologique sont donc réelles.
*/
export class wttrWeatherService implements WeatherProvider {
    constructor() {
        //empty
    }

    async readWeather(location: string): Promise<WttrObject> {
        const url = `https://wttr.in/${location}?format=j1`;
        const options = {
            'method': 'GET',
            'headers': { 'Accept-Language': 'fr-FR' },
        };
        const response: Promise<WttrObject> = await fetch(url, options)
            .then(res => res.json())
            .catch(e => {
                console.error({
                    'message': 'Erreur de chargement WTTR.IN',
                    error: e,
                });
            });
        return response;
    }
    
}
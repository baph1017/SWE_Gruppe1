/*
 * Copyright (C) 2015 - 2016 Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, Input, OnInit} from '@angular/core'
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import {Router} from '@angular/router'

import {HOME_PATH} from '../../app/routes'
import {log} from '../../shared'
import {Kunde} from '../shared'
import {KundeService} from '../shared/kunde.service'

/**
 * Komponente f&uuml;r das Tag <code>hs-stammdaten</code>
 */
@Component({
    selector: 'hs-update-stammdaten',
    templateUrl: './update-stammdaten.html',
})
export default class UpdateStammdatenComponent implements OnInit {
    // <hs-update-stammdaten [kunde]="...">
    @Input() kunde: Kunde

    form: FormGroup
    name: FormControl
    familienstand: FormControl
    geschlecht: FormControl
    kategorie: FormControl

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly kundeService: KundeService,
        private readonly router: Router) {
        console.log('UpdateStammdatenComponent.constructor()')
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Stammdaten des zu &auml;ndernden Kunden vorbelegen.
     */
    @log
    ngOnInit() {
        console.log('kunde=', this.kunde)

        // Definition und Vorbelegung der Eingabedaten
        this.name = new FormControl(this.kunde.name, Validators.compose([
            Validators.required, Validators.minLength(2),
            Validators.pattern(/^\w.*$/),
        ]))
        this.familienstand = new FormControl(this.kunde.familienstand, Validators.required)
        this.geschlecht = new FormControl(this.kunde.geschlecht)
        this.kategorie = new FormControl(this.kunde.kategorie)
        // this.geburtsdatum = new Control(this.kunde.geburtsdatum.toISOString())

        this.form = this.formBuilder.group({
            // siehe formControlName innerhalb von @Component({template: ...})
            name: this.name,
            familienstand: this.familienstand,
            geschlecht: this.geschlecht,
            kategorie: this.kategorie,
            // geburtsdatum: this.geburtsdatum
        })
    }

    /**
     * Die aktuellen Stammdaten f&uuml;r das angezeigte Kunde-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    @log
    onUpdate() {
        if (this.form.pristine) {
            console.log('keine Aenderungen')
            return
        }

        if (this.kunde === undefined) {
            console.error('kunde === undefined')
            return
        }

        // kategorie, kategorie und rabatt koennen im Formular nicht geaendert werden
        this.kunde.updateStammdaten(
            this.name.value, this.familienstand.value, this.geschlecht.value
            , this.kunde.kategorie , this.kunde.newsletter, this.kunde.interessen,
            this.kunde.email, this.kunde.adresse, this.kunde.homepage,
            this.kunde.umsatz)
        console.log('kunde=', this.kunde)

        

        const successFn = () => {
            console.log(`UpdateStammdaten: successFn: path: ${HOME_PATH}`)
            this.router.navigate([HOME_PATH])
        }
        const errFn: (status: number,
                      errors: {[s: string]: any}|undefined) => void =
            (status, errors = undefined) => {
            console.error(`UpdateStammdatenComponent.onUpdate(): errFn(): status: ${status}`)
            console.error('UpdateStammdatenComponent.onUpdate(): errFn(): errors', errors)
        }

        this.kundeService.update(this.kunde, successFn, errFn)

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false
    }

    toString() {
        return 'UpdateStammdatenComponent'
    }
}

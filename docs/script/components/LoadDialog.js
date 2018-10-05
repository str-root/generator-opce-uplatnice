import { SpremljeniNaloziSelect } from 'Components';

class LoadDialog extends React.Component {

    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleFileSelected = this.handleFileSelected.bind(this);

        this.loadFileRef = React.createRef();

        const popisNaloga = this.getPopisNaloga();

        this.state = {
            validationMsgType: 'none',
            validationMsg: '',
            selectedKey: popisNaloga.length > 0 ? popisNaloga[0].key : void 0,
            popisNaloga: popisNaloga
        }
        
        // na svaku promjenu u storage-u ažuriraj listu
        window.addEventListener('popisNalogaChanges', () => {
            let popisNaloga = this.getPopisNaloga();
            
            switch(popisNaloga.length) {
                case 1:
                    this.setState({ selectedKey: popisNaloga[0].key });
                    break;
            }

            this.setState({ popisNaloga: popisNaloga });
        });
    }

    handleInputChange(event) {
        const target = event.target;

        this.setState({
            selectedKey: target.value
        });
    }

    handleClick(ev) {
        ev.preventDefault();

        this.hideMsg();
        
        switch(ev.target.id) {
            case 'fieldset-load-dialog__load':
                this.ucitajNalog();
                break;
            case 'fieldset-load-dialog__delete':
                this.brisiNalog();
                break;
            case 'fieldset-load-dialog__load-file-button':
                // simuliram klik na skrivenu tipku
                this.loadFileRef.current.click();
                break;
        }
    }

    // source: https://www.html5rocks.com/en/tutorials/file/dndfiles/
    handleFileSelected(ev) {

        const selectedFile = ev.target.files[0],
              reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = progressEv => {
            const jsonString = progressEv.target.result;
            let loadedObject;

            try {
                loadedObject = JSON.parse(jsonString)
            } catch(ev) {
                this.showMsg('Greška kod učitavanja datoteke. Format datoteke nije prepoznat...','error');
                return;
            }
            
            this.props.onNalogLoad(loadedObject);

            this.showMsg('Nalog uspješno učitan iz datoteke','ok');
        }

        reader.readAsText(selectedFile);
    }

    getPopisNaloga() {
        return(Object.entries(localStorage).map(el => { return({ key:el[0], naziv_naloga:JSON.parse(el[1]).naziv_naloga });}));
    }

    ucitajNalog() {
        if(this.props.onNalogLoad) {
            this.props.onNalogLoad(JSON.parse(localStorage.getItem(this.state.selectedKey)));
        }
        
        this.showMsg('Nalog uspješno učitan','ok');
    }

    brisiNalog() {
        localStorage.removeItem(this.state.selectedKey);
        this.showMsg('Nalog uspješno obrisan sa vašeg računala ...','ok');
        window.dispatchEvent(new Event('popisNalogaChanges'));
    }

    hideMsg() {
        this.setState({
            validationMsgType: 'none',
            validationMsg: ''
        });
    }

    showMsg(msgText, msgType) {
        this.setState({
            validationMsgType: msgType,
            validationMsg: msgText
        });

        window.setTimeout(() => this.hideMsg(), 4000);
    }

    render() {
        return(
            <fieldset className="fieldset-load-dialog">
                <SpremljeniNaloziSelect popisNaloga={this.state.popisNaloga} value={ this.state.selectedKey } onChange={this.handleInputChange} >
                    <button id="fieldset-load-dialog__load" onClick={this.handleClick} disabled={this.state.popisNaloga.length==0}>Učitaj odabrani nalog</button>
                    <button id="fieldset-load-dialog__delete" onClick={this.handleClick} disabled={this.state.popisNaloga.length==0}>Obriši odabrani nalog</button>
                    <input className="fieldset-load-dialog__load-file" type="file" id="load-file" name="load-file" onChange={this.handleFileSelected} accept=".json" ref={this.loadFileRef} />
                    <button className="fieldset-load-dialog__load-file-button" id="fieldset-load-dialog__load-file-button" onClick={this.handleClick}>Učitaj nalog iz datoteke</button>
                </SpremljeniNaloziSelect>
                <span className={"fieldset-validation-msg fieldset-validation-msg-"+this.state.validationMsgType}>{this.state.validationMsg}</span>
            </fieldset>
        );
    }
}

export { LoadDialog };
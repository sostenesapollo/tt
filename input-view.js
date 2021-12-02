/**
 * Classe de criação e configuração de inputs
 * @author Rodrigo Hoffmann
 * @param object config 
 */
class InputView extends BaseInput {

    constructor(config) {

        // Define a configuração padrão da classe
        this.config = {
            type: 'WIDGET_INPUT',
            name: undefined,
            maxLength: undefined,
            value: undefined,
            placeholder: 'Digite',
            hint: false,
            clickable: true
        };

        // Sobreescreve a configuração padrão da classe
        if (config) {
            this.config = $.extend(true, this.config, config);
        }

        // Cria os elementos HTML
        this.container = new Div('row al-it-e gt-sm');
        this.inputColumn = new Div('col');
        this.inputContainer = new Label('ip col');
        this.input = new Input();
        this.label = new Label();
        this.line = new Span();
        this.helperContainer = new Div('ip-hp');
        this.errorContainer = new Div('ip-er');
        this.hintContainer = new Div('ip-ht');
        this.hintIcon = new Icon('ic ic-question-circle');
        this.tooltip = new Tooltip(this.config.hint);
        this.tooltip.setTargetContainer(this.hintContainer);
        this.tooltip.init();


        // Configura os elementos
        this.idToken = new IDToken().getToken();
        this.input.attr('id', this.idToken);
        this.inputContainer.attr('for', this.idToken);
        this.input.attr('name', this.config.name);
        this.input.attr('type', this.config.inputType);
        this.input.attr('autocomplete', 'nope');

        // Estiliza o container
        if (this.config.container) {
            if (typeof (this.config.container) == DATATYPE_OBJECT) {
                
                let container = this.config.container;

                // Classes
                if (container.class) {
                    this.container.addClass(container.class);
                }
        
                // Estilização
                if (container.style) {
                    Object.entries(container.style).forEach(index => {
                        this.container.css(index[0],index[1]);
                    });
                }            

            }
        }

        // Constroi o label
        if (typeof (this.config.label) == DATATYPE_OBJECT) {
            
            let label = this.config.label;
            
            // Valor
            if (label.value) {
                this.label.html(label.value);
            } else {
                this.label.html('--');
            }

            // Classes
            if (label.class) {
                this.label.addClass(label.class);
            }
    
            // Estilização
            if (label.style) {
                Object.entries(label.style).forEach(index => {
                    this.label.css(index[0],index[1]);
                });
            }            

        } else {
            this.label.html(this.config.label);
        }

        // Constroi o layout
        if (this.config.hint) {
            this.hintContainer.append(this.hintIcon);
            this.container.append(this.hintContainer);            
        }

        // Adiciona classes ao Input
        if (this.config.class) {
            this.input.addClass(this.config.class);
        }

        // Estilização
        if (this.config.style) {
            Object.entries(this.config.style).forEach(index => {
                if (index[0] && index[1]) {
                    this.input.css(index[0],index[1]);
                }
            });
        }  

        this.inputContainer.append(this.input);
        this.inputContainer.append(this.label);
        this.inputContainer.append(this.line);
        this.container.append(this.inputContainer);

        // Constroi o layout
        if (this.config.helper) {

            // Constroi o label
            if (typeof (this.config.label) == DATATYPE_OBJECT) {
                
                let helper = this.config.helper;
                
                // Valor
                if (helper.value) {
                    this.helperContainer.html(helper.value);
                } else {
                    this.helperContainer.html('--');
                }

                // Classes
                if (helper.class) {
                    this.helperContainer.addClass(helper.class);
                }
        
                // Estilização
                if (helper.style) {
                    Object.entries(helper.style).forEach(index => {
                        this.helperContainer.css(index[0],index[1]);
                    });
                }            

            } else {
                this.helperContainer.append(this.config.helper);
            }

            this.container.append(this.helperContainer);

        }         

    }

    /**
     * Inicializa o input
     */
    init() {
        
        let self = this;
        
        // Adiciona o valor ao campo
        if (this.config.value) {

            if (typeof (this.config.value) == DATATYPE_OBJECT) {

                let value = this.config.value;
                let labelValue = null;
                
                if (value.default) {
                    this.config.value = value.default;
                }

                this.input.hide();

                // Trata condições
                if (Array.isArray(value.condition)) {

                    value.condition.forEach(condition => {
                        if (condition.value == this.config.value) {
                            labelValue = condition.result
                        }
                    });

                } else {
                    
                    labelValue = this.config.value;

                }

                this.line.html(labelValue);

            } else {
                
                // Verifica se valor default provem de variável global
                if (String(this.config.value).match(/([?{])+([?a-zA-Z_])+([?}])+/g)) {
                    this.config.value = self.setGlobalValue(this.config.value);
                } 

            }
            
            this.input.val(formatValue(this.config.value, this.config.datatype));
            self.updateValue(this.input.val());
            this.setActive();
        }

        // Carrega as validações
        if (this.config.validate) {
            self.setValidation(this.config.validate);
        }

        // Max lenght
        if (this.config.maxLength) {
            this.input.attr('maxlength', this.config.maxLength);
        }
        
        // Read only
        if (this.config.readonly) {
            this.inputContainer.addClass('ip-rd');
            this.input.prop('disabled', true);
            this.setActive();
        }

        // Libera o campo pela propriedade "only"
        if (this.config.only) {
            let onlyValue;
            if (this.form.config.id == undefined) {
                onlyValue = 'onInsert';
            } else {
                onlyValue = 'onUpdate';
            }
            if (this.config.only != onlyValue) {
                this.inputContainer.addClass('ip-rd');
                this.input.prop('disabled', true);
                this.setActive();
            }
        }

        // Conecta os eventos do input
        this.input.blur(function () {
            if ($(this).val() !== '') {
                self.setActive();
            } else {
                if (!self.config.readonly) {
                    self.setInactive();
                }
            }
        });

        // Conecta o callback ao pressionar 'Enter'
        this.input.keydown(function (event) {
            if (event.keyCode == 13) {
                if ($(this).val() !== '') {
                    if (self.onEnter) {
                        self.onEnter.call();
                    }
                }
            }
        });

        // Conecta o callback de mudança de valor
        this.input.on('input', function () {
            if (!$(this).val()) {
                self.updateValue('');
            } else {
                self.updateValue($(this).val());
            }
        });

        // Define o menu de interações
        if (this.config.menu) {
            this.setMenu(this.config.menu);
        }

        // Define as interações do usuário
        if (this.config.rowOptions) {
            this.setOptions();
        }
    }

    /**
     * Define a máscara do campo
     * @param object config 
     */
    setMask(config) {
        switch(config.maskAPI) {
            case API_JQUERY_MASK:
                this.input.mask(config.mask, config.maskOptions);
                break;
            case API_INPUTMASK:
                this.input.inputmask(config.mask, config.maskOptions);
                break;
        }
    }

    /**
     * Define a validação do campo
     * @param string validation
     */
    setValidation(validation) {
        if (ui.getValidation(validation)) {
            this.config.validate = ui.getValidation(validation);

            // Carrega máscara
            if (!this.config.mask) {

                if (this.config.validate.mask) {

                    this.setMask(this.config.validate);
                } else {

                    this.input.unmask();
                }
            }
        }
    }

    /**
     * Sobreescreve o método
     * @param any value 
     */
    setValue(value, silent) {
        
        if (typeof (value) == 'object') {
            value = value.value;
        }

        value = formatValue(value, this.config.datatype);
        
        this.input.val(value);
        super.setValue(value, silent);  
    }

    /**
     * @param int value;
     */
     setLabelValue(value, silent) {

        value.labelValue = formatValue(value.labelValue, this.config.datatype);

        this.input.val(value.labelValue);
        super.setValue(value.labelValue, silent)
    }    
        

    /**
     * Define o campo como inativo
     */
    setEnabled() {
        this.inputContainer.removeClass('ip-ds');
        this.input.removeAttr('disabled');
        this.errorContainer.show();
    }

    /**
     * Define o campo como inativo
     */
    setDisabled() {
        this.setInactive();
        this.inputContainer.addClass('ip-ds');
        this.input.attr('disabled', 'true');
        this.errorContainer.hide();
    }

    // Foca no campo
    setFocus() {
        let self = this;
        setTimeout(function () {
            self.input.focus();
        }, TIME_FAST);
    }

    // Define o input como ativo 
    setActive() {
        this.inputContainer.addClass('active');
    }

    // Define o input como inativo 
    setInactive() {
        this.inputContainer.removeClass('active');
    }

    /**
     * Define o menu do input
     * @param object config 
     */
    setMenu(config) {
        let self = this;
        let menuContainer = new Div('col-auto');

        if (config.stepProccess) {
            let menu = new Dropdown({
                icon: 'ic-dots-horizontal',
                function: function () {
                    new StepProccess(config.stepProccess, self, self.getTarget()); //TODO:
                }
            });

            menuContainer.append(menu.getView());
        } else {
            let menu = new Dropdown({
                icon: 'ic-dots-horizontal',
                function: function () {
                    self[config.function]();
                }
            });

            menuContainer.append(menu.getView());
        }

        this.inputContainer.after(menuContainer);
        // this.container.append(menuContainer);
    }

    /**
     * Define campo como inválido
     * @param string error 
     */
    setError(error) {
        super.setError();

        this.inputContainer.addClass('ip-dg');
        this.hintIcon.removeClass('ic-question-circle ic-check-circle').addClass('ic-warning tx-dg');
        this.errorContainer.remove();
        this.errorContainer.html(error);
        this.errorContainer.attr('title', error);
        this.inputContainer.append(this.errorContainer);
    }

    /**
     * Define as opções de interações
     */
    setOptions() {
        let self = this;

        self.hintContainer.css({
            right: 30,
            marginRight: 5
        });

        self.config.rowOptions.forEach((value, index) => {
            
            // Configura o layout
            let optionContainer = new Div('ip-sh');
            let optionIcon = new Icon(`ic ${value.icon}`);

            // Estiliza o layout
            if (index > 0) {
                optionContainer.css({
                    marginRight: 8
                });
            }

            optionContainer.css({
                right: index * 30
            });

            self.hintContainer.css({
                right: (index + 1) * 30,
                marginRight: 5
            });

            // Constroi o layout
            optionContainer.append(optionIcon);
            self.container.append(optionContainer);

            optionContainer.click(function(e) {
                e.stopPropagation();

                if (value) {
                    new StepProccess({
                        steps: [
                            {
                                widget: {
                                    type: 'form',
                                    module: value.module,
                                    formIndex: value.formIndex ? value.formIndex : '',
                                    id: value.name ? value.name : ''
                                }
                            }
                        ]
                    }, self, self.getTarget());
                } 
            });
        });
    }

    // Limpa erro do campo
    clear() {
        super.clear();

        this.inputContainer.removeClass('ip-dg ip-sc');
        this.hintIcon.removeClass('ic-warning ic-check-circle tx-dg').addClass('ic-question-circle');
        this.errorContainer.remove();
    }

    // Limpa o campo
    clearInput() {
        this.input.val('');
    }

    // Marca o campo como correto
    setSuccess() {
        this.inputContainer.removeClass('ip-dg').addClass('ip-sc');
        this.hintIcon.removeClass('ic-warning ic-question-circle tx-dg').addClass('ic-check-circle tx-sc');
        this.errorContainer.remove();
    }

    /**
     * Valida o campo
     * @returns bool
     */
    validate() {
        let isValid = true;

        // Verifica se o campo possui validação
        if (this.config.validate) {

            // Validação de campo obrigatório
            if (this.config.validate.required) {
                if (!this.input.val()) {
                    isValid = false;
                }
            }

            // Validação regex
            if ((this.config.required || this.config.value) && this.config.validate.regexJS) {
                var regex = new RegExp(this.config.validate.regexJS, 'i');

                if (!this.input.val().match(regex)) {
                    isValid = false;
                }
            }

            // Validação por função especificada
            if ((this.config.required || this.config.value) && this.config.validate.functionJS) {
                try {
                    isValid = window[this.config.validate.functionJS](this.input.val());
                } catch (error) {
                    console.log(error);
                    isValid = false;
                }
            }
        }

        if (isValid) {
            // Limpa o campo
            this.clear();
        } else {
            // Adiciona mensagem de erro ao campo
            if (this.config.validate.errorMessage) {
                this.setError(this.config.validate.errorMessage);
            } else {
                this.setError('Preencha este campo corretamente');
            }
        }
        return isValid;
    }

    setOnEnter(onEnter) {
        this.onEnter = onEnter;
    }

    /**
     * @returns view
     */
    getView() {
        return this.container;
    }
    
}

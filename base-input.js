/**
 * Classe base de todos os campos dos formulários
 * Contém os métodos que se repetem em todos os inputs
 * @requires FormView
 * @author Rodrigo Hoffmann
 */
class BaseInput extends BaseWidget {

    constructor(config) {
        super(config);

        this.form;
        this.isEnabled = true;
        this.callbacks = [];

        // Define a configuração padrão da classe
        this.config = {

        }

        // Sobreescreve a configuração padrão da classe
        if (config) {
            this.config = $.extend(true, this.config, config);
        }

        // Restaura o filtro dependente
        if (this.config.dependantFilter) {
            this.dependantFilter = this.config.dependantFilter;
        }

        // Restaura o filtro
        if (this.config.filter) {
            this.filter = this.config.filter;
        }
    }

    /**
     * Callback de mudança de valor de campo
     * @param any value
     */
    updateValue(value) {
        let self = this
        this.config.value = sanitize(value, this.config.datatype);

        if (this.onUpdateValue) {
            this.onUpdateValue.call(this, value);
        }

        this.updateForm();

        // Verifica se o valor do campo foi alterado
        if (this.currentValue !== value) {

            // Campos dependentes de uma ação ou um valor de outro campo
            let dependants = this.config.dependants;
         
            if (dependants) {
                dependants.forEach(dependant => {
                    self.handleDependant(dependant);
                });
            }
        }
    }

    /**
     * Executa ações do dependente
     * @param object dependant 
     */
    handleDependant(dependant) {

        let fieldDependant = this.getForm().getFieldByName(dependant.field);
        let isValid = false;

        dependant.rules.forEach(rule => {
            if (!isValid) {

                if (statement(this.getValue(), rule.operator, rule.value)) {
                    isValid = true;

                    // Define a validação do campo dependente
                    if (rule.validate) {
                        fieldDependant.setValidation({ type: rule.validate });
                        fieldDependant.setDatatype(rule.validate);
                    }
                }
            }
        });

        if (isValid) {
            fieldDependant.setEnabled();
            fieldDependant.setDependantFilter(this.getValue(), this);
            
        } else {

            fieldDependant.setDisabled();

            switch (fieldDependant.getType()) {
                case WIDGET_LIST_INPUT:
                    fieldDependant.updateValue(new Array());
                    break;
                default:
                    fieldDependant.updateValue(undefined);
                    break;
            }
        }

        fieldDependant.clearInput();
        fieldDependant.setInactive();
    }

    /**
     * Atualiza o valor do campo
     * @param any value
     * @param bool silent
     */
    setValue(value, silent) {

        this.config.value = sanitize(value, this.config.datatype);

        if (this.onUpdateValue) {
            this.onUpdateValue.call(this, value);
        }
        
        this.updateForm(silent);
    }

    // Atualiza o valor do campo e do formulário
    updateForm(silent) {

        if (this.getForm()) {
            this.getForm().updateValue(this.getName(), this.getValue(), silent);
        }
    }

    /**
     * Inicializa o input
     */
    init() {
        
    }

    /**
     * @param fuction onUpdateValue
     */
    setOnUpdateValue(onUpdateValue) {
        this.onUpdateValue = onUpdateValue;
    }

    /**
     * Ativa o campo
     */
    setEnabled() {
        this.isEnabled = true;
    }

    /**
     * Define um valor temporário a ser restaurado para fins de confirmação de mudança de valor
     */
    setCurrentValue(currentValue) {
        this.currentValue = currentValue;
    }


    /**
     * Define um valor default quando é de uma variábel global
     */
    setGlobalValue(value) {

        let RegExp = String(value).match(/([?{])+([?a-zA-Z_])+([?}])+/g);

        if (RegExp) {
            let user = ui.getUserData();
            value = user[String(value).replace(/([{}])/gi,'')];
        }
    
        return value;

    }

    /**
     * Define o datatype do campo
     * @param string datatype 
     */
    setDatatype(datatype) {
        this.config.datatype = datatype;
        if (this.getForm()) {
            this.getForm().updateFieldDatatype({
                name: this.getName(),
                datatype: datatype
            });
        }
    }

    /**
     * Adicionar os callbacks em um array
     * Quando houver um change chamar o metodo setAdd no updateValue e executar todos os callbacks
     * Registrar um callback atraves de uma string, por exemplo image-1, image-2 tem o seu callback
     */ 
    addCallback(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Restaura para o último valor
     */
    restoreValue() {
        this.setValue(this.getCurrentValue());
    }

    /**
     * Retorna o valor anterior do campo, o caso de mudança
     * @returns any
     */
    getCurrentValue() {
        return this.currentValue;
    }

    /**
     * Desativa o campo
     */
    setDisabled() {
        this.isEnabled = false;
    }

    /**
     * Define o campo como ativo
     */
    setActive() {

    }

    /**
     * Define o campo como inativo
     */
    setInactive() {

    }

    /**
     * Limpa o valor do campo
     */
    clearInput() {

    }

    /**
     * Método que passa a referência do formulário
     * @param FormView form
     */
    setForm(form) {
        this.form = form;
    }

    /**
     * Retorna o formulário pai
     * @returns FormView
     */
    getForm() {
        return this.form;
    }

    /**
     * Retorna os valores do formulário
     * @returns object
     */
    getFormValues() {
        return this.form.getValues();
    }

    /**
     * Retorna os valores completo do formulário
     * @returns object
     */
     getFormFullValues() {
        return this.form.getFullValues();
    }

    /**
     * Adiciona o filtro de campo dependente
     * @param string filter
     */
    setDependantFilter(filter) {

        this.dependantFilter = filter;

        this.getForm().setDependantFilter({
            name: this.getName(),
            filter: filter
        });
    }

    /**
     * Adiciona o filtro de campo dependente
     * @param filter filter
     */
    setFilter(filter) {
        this.filter = filter;

        // Atualiza o filtro dependente na configuração do formulário
        this.getForm().setFieldFilter({
            name: this.getName(),
            filter: filter
        });
    }

    /**
     * Executa ou método de outro campo do mesmo formulário
     */
    runFormFieldMethodByName(config) {
        this.getForm().runFieldMethodByName(config);
    };

    /**
     * Define o campo como inválido
     */
    setError() {
        this.hasError = true;
    }

    /**
     * Limpa o erro do campo
     */
    clear() {
        this.hasError = false;
    }

    /**
     * @returns bool
     */
    getHasError() {
        return this.hasError;
    }

    /**
     * @return any
     */
    getDependantFilter() {
        return this.dependantFilter;
    }

    /**
     * Define uma validação para o campo
     * @param object validation 
     */
    setValidation(validation) {

    }

    /**
     * @returns object
     */
    getDependants() {
        return this.config.dependants;
    }

    /**
     * Define as opções do menu
     */
    setMenu(menu) {

    }

    /**
     * @returns bool
     */
    validate() {
        return true;
    }

    /**
     * @returns int
     */
    getModule() {
        return this.config.module;
    }

    /**
     * @returns string
     */
    getType() {
        return this.config.type;
    }

    /**
     * @returns string
     */
    getName() {
        return this.config.name;
    }

    /**
     * @returns string
     */
     getLabel() {
        return this.config.label;
    }    

    /**
     * @returns any
     */
    getValue() {
        return this.config.value;
    }

    /**
    * @returns any
    */
    getFullValue() {

        let values = {};
        values.value = this.config.value;
        values.labelValue = this.config.labelValue;
        return values;
    }

    /**
     * @returns any
     */
     getLabelValue() {
        return this.config.labelValue;
    }    
}
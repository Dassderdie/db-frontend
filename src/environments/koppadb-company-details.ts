/**
 * Because importing other files in environment files seems broken since Angular 12 you must manually copy this literal into the different environments
 */
export const koppaDbCompanyDetails = {
    email: 'contact@koppadb.com',
    phoneNumber: '+49 (0) 1517 2959696',
    address: `
            <strong> KoppaDb UG(haftungsbeschränkt)</strong><br />
            c/o Universität Potsdam <br />
            August-Bebel-Straße 89 <br />
            Haus 7 <br />
            14482 Potsdam`,
    representatives: 'Julian Schmidt, Simon Meusel',
    commercialRegister: {
        districtCourt: 'Amtsgericht Potsdam',
        registerId: 'HRB 34804',
    },
    vatIdentificationNumber: 'DE338668572',
};

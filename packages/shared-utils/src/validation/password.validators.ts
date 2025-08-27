import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export interface PasswordValidationOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  allowedSpecialChars?: string;
}

const DEFAULT_PASSWORD_OPTIONS: Required<PasswordValidationOptions> = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  allowedSpecialChars: '@$!%*?&',
};

/**
 * Custom password validation decorator that enforces comprehensive password requirements
 */
export function IsStrongPassword(
  options: PasswordValidationOptions = {},
  validationOptions?: ValidationOptions,
) {
  const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [opts],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const password = value as string;
          const config = args.constraints[0] as Required<PasswordValidationOptions>;

          // Check length constraints
          if (password.length < config.minLength || password.length > config.maxLength) {
            return false;
          }

          // Check uppercase requirement
          if (config.requireUppercase && !/[A-Z]/.test(password)) {
            return false;
          }

          // Check lowercase requirement
          if (config.requireLowercase && !/[a-z]/.test(password)) {
            return false;
          }

          // Check numbers requirement
          if (config.requireNumbers && !/\d/.test(password)) {
            return false;
          }

          // Check special characters requirement
          if (config.requireSpecialChars) {
            const specialCharsRegex = new RegExp(`[${config.allowedSpecialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
            if (!specialCharsRegex.test(password)) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const config = args.constraints[0] as Required<PasswordValidationOptions>;
          const requirements: string[] = [];

          requirements.push(`${config.minLength}-${config.maxLength} characters`);
          
          if (config.requireUppercase) requirements.push('uppercase letter');
          if (config.requireLowercase) requirements.push('lowercase letter');
          if (config.requireNumbers) requirements.push('number');
          if (config.requireSpecialChars) requirements.push(`special character (${config.allowedSpecialChars})`);

          return `Password must contain: ${requirements.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Predefined password validation decorators for common use cases
 */

/**
 * Strong password validation with all requirements (default)
 * - 8-100 characters
 * - Uppercase, lowercase, number, special character
 */
export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return IsStrongPassword({}, validationOptions);
}

/**
 * Medium password validation with relaxed special character requirement
 * - 8-100 characters  
 * - Uppercase, lowercase, number
 * - Special characters optional
 */
export function IsPasswordMedium(validationOptions?: ValidationOptions) {
  return IsStrongPassword(
    {
      requireSpecialChars: false,
    },
    validationOptions,
  );
}

/**
 * Basic password validation with minimal requirements
 * - 8-100 characters only
 */
export function IsPasswordBasic(validationOptions?: ValidationOptions) {
  return IsStrongPassword(
    {
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    },
    validationOptions,
  );
}
